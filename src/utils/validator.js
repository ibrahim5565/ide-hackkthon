/**
 * Joi Validation Schemas for Proposal Auto-Generator Platform
 */

const Joi = require('joi');

const institutionProfileSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Institution name is required',
    'string.min': 'Institution name must be at least 2 characters',
    'any.required': 'Institution name is required',
  }),
  type: Joi.string()
    .valid('university', 'college', 'institute', 'school', 'polytechnic', 'research_center')
    .required()
    .messages({
      'any.only': 'Institution type must be one of: university, college, institute, school, polytechnic, research_center',
      'any.required': 'Institution type is required',
    }),
  location: Joi.string().min(2).max(300).required().messages({
    'any.required': 'Institution location is required',
  }),
  established: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
  departments: Joi.array().items(Joi.string().min(1)).min(1).required().messages({
    'array.min': 'At least one department must be specified',
    'any.required': 'Departments list is required',
  }),
  studentCount: Joi.number().integer().min(0).optional(),
  accreditation: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  contactEmail: Joi.string().email().optional(),
  vision: Joi.string().max(1000).optional(),
  mission: Joi.string().max(1000).optional(),
  specializations: Joi.array().items(Joi.string()).optional(),
}).options({ allowUnknown: false });

const gapItemSchema = Joi.object({
  id: Joi.string().optional(),
  title: Joi.string().min(3).max(300).required().messages({
    'any.required': 'Each gap item must have a title',
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'any.required': 'Each gap item must have a description',
  }),
  category: Joi.string()
    .valid(
      'skill_gap',
      'infrastructure',
      'curriculum',
      'industry_alignment',
      'research',
      'technology',
      'collaboration',
      'funding'
    )
    .required()
    .messages({
      'any.only':
        'Gap category must be one of: skill_gap, infrastructure, curriculum, industry_alignment, research, technology, collaboration, funding',
      'any.required': 'Each gap item must have a category',
    }),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required().messages({
    'any.only': 'Severity must be one of: low, medium, high, critical',
    'any.required': 'Each gap item must have a severity level',
  }),
  affectedDepartments: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one affected department must be specified per gap',
    'any.required': 'Affected departments are required for each gap',
  }),
  estimatedImpact: Joi.string().max(1000).optional(),
}).options({ allowUnknown: false });

const proposalRequestSchema = Joi.object({
  institutionProfile: institutionProfileSchema.required().messages({
    'any.required': 'institutionProfile is required',
  }),
  gapAnalysis: Joi.array().items(gapItemSchema).min(1).max(20).required().messages({
    'array.min': 'At least one gap analysis item is required',
    'array.max': 'Maximum of 20 gap analysis items allowed',
    'any.required': 'gapAnalysis array is required',
  }),
  proposalType: Joi.string().valid('vac', 'internship', 'hackathon').required().messages({
    'any.only': 'proposalType must be one of: vac, internship, hackathon',
    'any.required': 'proposalType is required',
  }),
}).options({ allowUnknown: false });

/**
 * Validates the incoming proposal generation request.
 * @param {object} data - Raw request body
 * @returns {{ error: Joi.ValidationError|null, value: object|null }}
 */
function validateProposalRequest(data) {
  const { error, value } = proposalRequestSchema.validate(data, { abortEarly: false });
  return { error, value };
}

module.exports = { validateProposalRequest };
