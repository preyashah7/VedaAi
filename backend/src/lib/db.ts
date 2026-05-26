import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri: string): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(mongoUri);
};
