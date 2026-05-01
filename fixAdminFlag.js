import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/nyrah';

mongoose.connect(url).then(async () => {
  const collection = mongoose.connection.db.collection('users');
  const users = await collection.find({}).toArray();
  
  for (const u of users) {
    if (typeof u.isAdmin === 'string') {
      const boolVal = u.isAdmin === 'true';
      await collection.updateOne({ _id: u._id }, { $set: { isAdmin: boolVal } });
      console.log('Fixed string to bool for', u.email);
    }
  }
  
  mongoose.disconnect();
}).catch(console.error);
