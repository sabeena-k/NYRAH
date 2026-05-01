import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/nyrah';

mongoose.connect(url).then(async () => {
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('Users in DB:', users.map(u => ({ email: u.email, isAdmin: u.isAdmin })));
  
  // Make sabeena admin or the first user
  let admin = users.find(u => u.isAdmin);
  let target = users.find(u => u.email === 'sabeena.k6601@gmail.com') || users[0];
  
  if (target) {
    await mongoose.connection.db.collection('users').updateOne({ _id: target._id }, { $set: { isAdmin: true } });
    console.log('Made', target.email, 'an admin!');
  }
  
  mongoose.disconnect();
}).catch(console.error);
