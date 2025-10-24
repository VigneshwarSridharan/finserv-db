/**
 * Swagger/OpenAPI 3.0 Configuration
 */
export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Portfolio Management API',
    version: '1.0.0',
    description: 'RESTful API for managing portfolio summaries with JWT authentication',
    contact: {
      name: 'API Support',
      email: 'support@portfolio.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints'
    },
    {
      name: 'Portfolio',
      description: 'Portfolio management endpoints'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from /auth/login'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          user_id: {
            type: 'integer',
            description: 'User ID'
          },
          username: {
            type: 'string',
            description: 'Username'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email'
          },
          first_name: {
            type: 'string',
            description: 'First name'
          },
          last_name: {
            type: 'string',
            description: 'Last name'
          }
        }
      },
      PortfolioSummary: {
        type: 'object',
        properties: {
          summary_id: {
            type: 'integer',
            description: 'Portfolio summary ID'
          },
          user_id: {
            type: 'integer',
            description: 'User ID'
          },
          asset_type: {
            type: 'string',
            enum: ['securities', 'fixed_deposits', 'recurring_deposits', 'gold', 'real_estate', 'other_assets'],
            description: 'Type of asset'
          },
          total_investment: {
            type: 'string',
            description: 'Total investment amount'
          },
          current_value: {
            type: 'string',
            description: 'Current value of portfolio'
          },
          unrealized_pnl: {
            type: 'string',
            description: 'Unrealized profit/loss'
          },
          realized_pnl: {
            type: 'string',
            description: 'Realized profit/loss'
          },
          total_pnl: {
            type: 'string',
            description: 'Total profit/loss'
          },
          percentage_of_portfolio: {
            type: 'string',
            description: 'Percentage of total portfolio'
          },
          last_updated: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password', 'first_name', 'last_name'],
        properties: {
          username: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            example: 'johndoe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com'
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePass123'
          },
          first_name: {
            type: 'string',
            example: 'John'
          },
          last_name: {
            type: 'string',
            example: 'Doe'
          },
          phone: {
            type: 'string',
            example: '+919876543210'
          },
          date_of_birth: {
            type: 'string',
            format: 'date',
            example: '1990-01-15'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com'
          },
          password: {
            type: 'string',
            example: 'SecurePass123'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User'
              },
              token: {
                type: 'string',
                description: 'JWT token'
              }
            }
          },
          message: {
            type: 'string',
            example: 'Login successful'
          }
        }
      },
      CreatePortfolioRequest: {
        type: 'object',
        required: ['asset_type', 'total_investment', 'current_value'],
        properties: {
          asset_type: {
            type: 'string',
            enum: ['securities', 'fixed_deposits', 'recurring_deposits', 'gold', 'real_estate', 'other_assets'],
            example: 'securities'
          },
          total_investment: {
            type: 'number',
            minimum: 0,
            example: 100000
          },
          current_value: {
            type: 'number',
            minimum: 0,
            example: 115000
          },
          unrealized_pnl: {
            type: 'number',
            example: 15000
          },
          realized_pnl: {
            type: 'number',
            example: 0
          },
          total_pnl: {
            type: 'number',
            example: 15000
          },
          percentage_of_portfolio: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            example: 45.5
          }
        }
      },
      UpdatePortfolioRequest: {
        type: 'object',
        properties: {
          asset_type: {
            type: 'string',
            enum: ['securities', 'fixed_deposits', 'recurring_deposits', 'gold', 'real_estate', 'other_assets']
          },
          total_investment: {
            type: 'number',
            minimum: 0
          },
          current_value: {
            type: 'number',
            minimum: 0
          },
          unrealized_pnl: {
            type: 'number'
          },
          realized_pnl: {
            type: 'number'
          },
          total_pnl: {
            type: 'number'
          },
          percentage_of_portfolio: {
            type: 'number',
            minimum: 0,
            maximum: 100
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object'
          },
          message: {
            type: 'string'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Error message'
          },
          statusCode: {
            type: 'integer',
            example: 400
          }
        }
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Validation failed'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email'
                },
                message: {
                  type: 'string',
                  example: 'Invalid email'
                }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Create a new user account with username, email, and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error or user already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Authenticate user and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse'
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/portfolios': {
      get: {
        tags: ['Portfolio'],
        summary: 'Get all portfolio summaries',
        description: 'Retrieve all portfolio summaries for the authenticated user',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'List of portfolio summaries',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/PortfolioSummary'
                      }
                    },
                    count: {
                      type: 'integer',
                      example: 5
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Portfolio'],
        summary: 'Create new portfolio summary',
        description: 'Create a new portfolio summary for the authenticated user',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreatePortfolioRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Portfolio created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      $ref: '#/components/schemas/PortfolioSummary'
                    },
                    message: {
                      type: 'string',
                      example: 'Portfolio created successfully'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error or duplicate entry',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/portfolios/{id}': {
      get: {
        tags: ['Portfolio'],
        summary: 'Get portfolio summary by ID',
        description: 'Retrieve a specific portfolio summary by its ID',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Portfolio summary ID'
          }
        ],
        responses: {
          '200': {
            description: 'Portfolio summary details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      $ref: '#/components/schemas/PortfolioSummary'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '403': {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '404': {
            description: 'Portfolio not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['Portfolio'],
        summary: 'Update portfolio summary',
        description: 'Update an existing portfolio summary',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Portfolio summary ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdatePortfolioRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Portfolio updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      $ref: '#/components/schemas/PortfolioSummary'
                    },
                    message: {
                      type: 'string',
                      example: 'Portfolio updated successfully'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '403': {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '404': {
            description: 'Portfolio not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Portfolio'],
        summary: 'Delete portfolio summary',
        description: 'Delete an existing portfolio summary',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Portfolio summary ID'
          }
        ],
        responses: {
          '200': {
            description: 'Portfolio deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Portfolio deleted successfully'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '403': {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '404': {
            description: 'Portfolio not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    }
  }
};

