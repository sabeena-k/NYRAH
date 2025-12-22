import User from '../models/userSchema.js'
import bcrypt from 'bcrypt'

export const createUser=async({name,email,phone,password})=>{
    const hashedPassword=await bcrypt.hash(password,8);
    const user=new User({name,email,phone,password:hashedPassword});
    return await user.save();
};
export const findUserByEmail=async(email)=>{
    return await User.findOne({email});
}

export const findUserById = async (id) => {
    return await User.findById(id);
};
export const updateUserPassword = async (email, hashedPassword) => {
  return await User.findOneAndUpdate(
    { email },
    { password: hashedPassword,
      resetOtp: null,
      otpExpire: null
    },
    { new: true }
  );
};

export const saveResetOtp=async(email,otp)=>{
    return await User.findOneAndUpdate(
        { email },
        { resetOtp: otp, otpExpire: Date.now() + 5 * 60 * 1000 },
        { new: true }
    );
};
export const verifyResetOtp = async (email, enteredOtp) => {
  const user = await User.findOne({ email });

  if (!user) return { status: "notfound" };

  if (user.resetOtp !== enteredOtp) {
    return { status: "invalid" };
  }

  if (user.otpExpire < Date.now()) {
    return { status: "expired" };
  }

  return { status: "success" };
};

