import z from 'zod';

const registerValidationSchema= z.object({
  body: z.object({  
    name: z
      .string({
        required_error: 'Name is required!',
      })
      .min(3, 'Name must be at least 3 characters long')
      .max(50, 'Name must be at most 50 characters long'),
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    password: z.string({
      required_error: 'Password is required!',
    }).min(6, 'Password must be at least 6 characters long')
  }),
});


const loginUser = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    password: z.string({
      required_error: 'Password is required!',
    }),
  }),
});
const passwordResetSchema = z.object({
  body: z.object({   
    password: z.string({
      required_error: 'Password is required!',
    }).min(6, 'Password must be at least 6 characters long')
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6),
    newPassword: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});
const verifyOtpSchema = z.object({
  body: z.object({
    otpCode: z.string().length(6, 'Please enter a 6-character OTP code'),
    hexCode: z
      .string({
        required_error: 'hexCode is required',
      })
      .length(32, 'hexCode must be exactly 32 characters long'),
  }),
});

export const authValidation = {
  loginUser,
  passwordResetSchema,
  changePasswordValidationSchema,
  verifyOtpSchema,
  registerValidationSchema
};
