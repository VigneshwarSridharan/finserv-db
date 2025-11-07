import { eq, and, gte, lte, or } from 'drizzle-orm';
import { db } from '../config/database';
import { 
  bondRepayments, 
  bondDetails, 
  userSecurityHoldings, 
  securities 
} from '../db/schemas/brokers-securities.schema';
import { BondRepaymentScheduleDTO } from '../types';
import logger from '../utils/logger';

export interface CouponScheduleItem {
  scheduled_date: string;
  scheduled_amount: number;
  coupon_period_start: string;
  coupon_period_end: string;
}

export interface PrincipalScheduleItem {
  scheduled_date: string;
  scheduled_amount: number;
}

/**
 * Calculate coupon payment amount based on holding quantity, face value, and coupon rate
 */
export function calculateCouponAmount(
  quantity: number,
  faceValue: number | null,
  couponRate: number | null
): number {
  if (!couponRate || couponRate === 0) {
    return 0;
  }

  // Use face value if available, otherwise assume 100 (standard bond face value)
  const principal = (faceValue || 100) * quantity;
  return (principal * couponRate) / 100;
}

/**
 * Calculate number of months between two dates
 */
function monthsBetween(startDate: Date, endDate: Date): number {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  return years * 12 + months;
}

/**
 * Add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Get payment frequency in months
 */
function getFrequencyMonths(frequency: string | null): number {
  switch (frequency) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 3;
    case 'semi_annual':
      return 6;
    case 'annual':
      return 12;
    default:
      return 12; // Default to annual
  }
}

/**
 * Generate coupon payment schedule based on bond details and holding
 */
export async function generateCouponSchedule(
  holdingId: number,
  securityId: number,
  userId: number,
  startDate?: string,
  includePast: boolean = false
): Promise<CouponScheduleItem[]> {
  // Get bond details and holding
  const [holding] = await db
    .select()
    .from(userSecurityHoldings)
    .where(
      and(
        eq(userSecurityHoldings.holding_id, holdingId),
        eq(userSecurityHoldings.user_id, userId),
        eq(userSecurityHoldings.security_id, securityId)
      )
    )
    .limit(1);

  if (!holding) {
    throw new Error('Holding not found');
  }

  const [bond] = await db
    .select()
    .from(bondDetails)
    .where(eq(bondDetails.security_id, securityId))
    .limit(1);

  if (!bond) {
    throw new Error('Bond details not found');
  }

  const [security] = await db
    .select()
    .from(securities)
    .where(eq(securities.security_id, securityId))
    .limit(1);

  if (!security) {
    throw new Error('Security not found');
  }

  if (!bond.coupon_rate || !bond.coupon_payment_frequency) {
    throw new Error('Bond does not have coupon rate or payment frequency configured');
  }

  const issueDate = bond.issue_date ? new Date(bond.issue_date) : holding.first_purchase_date ? new Date(holding.first_purchase_date) : new Date();
  const maturityDate = new Date(bond.maturity_date);
  const frequencyMonths = getFrequencyMonths(bond.coupon_payment_frequency);
  const couponRate = parseFloat(bond.coupon_rate.toString());
  const faceValue = security.face_value ? parseFloat(security.face_value.toString()) : 100;
  const quantity = parseFloat(holding.quantity.toString());

  const schedule: CouponScheduleItem[] = [];
  const today = new Date();
  const start = startDate ? new Date(startDate) : (includePast ? issueDate : today);

  // Calculate first coupon date (use next_coupon_date if available, otherwise calculate from issue date)
  let currentCouponDate = bond.next_coupon_date 
    ? new Date(bond.next_coupon_date)
    : addMonths(issueDate, frequencyMonths);

  // If start date is before first coupon date, start from first coupon date
  if (currentCouponDate < start) {
    // Find the first coupon date after start date
    while (currentCouponDate < start) {
      currentCouponDate = addMonths(currentCouponDate, frequencyMonths);
    }
  }

  // Generate schedule until maturity
  while (currentCouponDate <= maturityDate) {
    // Skip if before start date and not including past
    if (!includePast && currentCouponDate < today) {
      currentCouponDate = addMonths(currentCouponDate, frequencyMonths);
      continue;
    }

    const periodStart = addMonths(currentCouponDate, -frequencyMonths);
    const periodEnd = new Date(currentCouponDate);
    periodEnd.setDate(periodEnd.getDate() - 1); // End date is day before payment

    const couponAmount = calculateCouponAmount(quantity, faceValue, couponRate);

    schedule.push({
      scheduled_date: currentCouponDate.toISOString().split('T')[0],
      scheduled_amount: couponAmount,
      coupon_period_start: periodStart.toISOString().split('T')[0],
      coupon_period_end: periodEnd.toISOString().split('T')[0]
    });

    currentCouponDate = addMonths(currentCouponDate, frequencyMonths);
  }

  return schedule;
}

/**
 * Generate principal repayment schedule
 */
export async function generatePrincipalSchedule(
  holdingId: number,
  securityId: number,
  userId: number
): Promise<PrincipalScheduleItem[]> {
  const [holding] = await db
    .select()
    .from(userSecurityHoldings)
    .where(
      and(
        eq(userSecurityHoldings.holding_id, holdingId),
        eq(userSecurityHoldings.user_id, userId),
        eq(userSecurityHoldings.security_id, securityId)
      )
    )
    .limit(1);

  if (!holding) {
    throw new Error('Holding not found');
  }

  const [bond] = await db
    .select()
    .from(bondDetails)
    .where(eq(bondDetails.security_id, securityId))
    .limit(1);

  if (!bond) {
    throw new Error('Bond details not found');
  }

  const [security] = await db
    .select()
    .from(securities)
    .where(eq(securities.security_id, securityId))
    .limit(1);

  if (!security) {
    throw new Error('Security not found');
  }

  const maturityDate = new Date(bond.maturity_date);
  const faceValue = security.face_value ? parseFloat(security.face_value.toString()) : 100;
  const quantity = parseFloat(holding.quantity.toString());
  const principalAmount = faceValue * quantity;

  return [{
    scheduled_date: maturityDate.toISOString().split('T')[0],
    scheduled_amount: principalAmount
  }];
}

/**
 * Update payment status based on dates
 * scheduled -> overdue (if past scheduled_date and not paid)
 * overdue -> missed (if past scheduled_date + grace period, default 30 days)
 */
export async function updatePaymentStatus(repaymentId: number): Promise<void> {
  const [repayment] = await db
    .select()
    .from(bondRepayments)
    .where(eq(bondRepayments.repayment_id, repaymentId))
    .limit(1);

  if (!repayment) {
    throw new Error('Repayment not found');
  }

  // If already paid or missed, don't update
  if (repayment.payment_status === 'paid' || repayment.payment_status === 'missed') {
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduledDate = new Date(repayment.scheduled_date);
  scheduledDate.setHours(0, 0, 0, 0);
  const daysPastDue = Math.floor((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));

  let newStatus: 'scheduled' | 'paid' | 'overdue' | 'missed' = repayment.payment_status as any;

  if (repayment.actual_payment_date) {
    newStatus = 'paid';
  } else if (daysPastDue > 30) {
    newStatus = 'missed';
  } else if (daysPastDue > 0) {
    newStatus = 'overdue';
  } else {
    newStatus = 'scheduled';
  }

  if (newStatus !== repayment.payment_status) {
    await db
      .update(bondRepayments)
      .set({
        payment_status: newStatus,
        updated_at: new Date()
      })
      .where(eq(bondRepayments.repayment_id, repaymentId));
  }
}

/**
 * Generate complete repayment schedule (coupons + principal) and save to database
 */
export async function generateAndSaveRepaymentSchedule(
  scheduleDTO: BondRepaymentScheduleDTO,
  userId: number
): Promise<number> {
  const { holding_id, security_id, start_date, include_past } = scheduleDTO;

  // Verify holding belongs to user
  const [holding] = await db
    .select()
    .from(userSecurityHoldings)
    .where(
      and(
        eq(userSecurityHoldings.holding_id, holding_id),
        eq(userSecurityHoldings.user_id, userId),
        eq(userSecurityHoldings.security_id, security_id)
      )
    )
    .limit(1);

  if (!holding) {
    throw new Error('Holding not found or does not belong to user');
  }

  // Check for existing repayments for this holding
  const existing = await db
    .select()
    .from(bondRepayments)
    .where(eq(bondRepayments.holding_id, holding_id))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Repayment schedule already exists for this holding. Delete existing repayments first.');
  }

  let createdCount = 0;

  try {
    // Generate coupon schedule
    const couponSchedule = await generateCouponSchedule(
      holding_id,
      security_id,
      userId,
      start_date,
      include_past || false
    );

    // Insert coupon payments
    for (const coupon of couponSchedule) {
      await db.insert(bondRepayments).values({
        user_id: userId,
        holding_id,
        security_id,
        repayment_type: 'coupon',
        scheduled_date: coupon.scheduled_date,
        scheduled_amount: coupon.scheduled_amount.toString(),
        coupon_period_start: coupon.coupon_period_start,
        coupon_period_end: coupon.coupon_period_end,
        payment_status: 'scheduled'
      });
      createdCount++;
    }

    // Generate principal schedule
    const principalSchedule = await generatePrincipalSchedule(
      holding_id,
      security_id,
      userId
    );

    // Insert principal payment
    for (const principal of principalSchedule) {
      await db.insert(bondRepayments).values({
        user_id: userId,
        holding_id,
        security_id,
        repayment_type: 'principal',
        scheduled_date: principal.scheduled_date,
        scheduled_amount: principal.scheduled_amount.toString(),
        payment_status: 'scheduled'
      });
      createdCount++;
    }

    logger.info('Generated repayment schedule', {
      holding_id,
      security_id,
      coupon_count: couponSchedule.length,
      principal_count: principalSchedule.length,
      total_created: createdCount
    });

    return createdCount;
  } catch (error: any) {
    logger.error('Error generating repayment schedule', {
      holding_id,
      security_id,
      error: error.message
    });
    throw error;
  }
}

