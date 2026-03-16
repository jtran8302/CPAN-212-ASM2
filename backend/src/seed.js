import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Category } from './models/Category.js';
import { ServiceRequest } from './models/ServiceRequest.js';
import { Quote } from './models/Quote.js';

const seed = async () => {
    await connectDB();

    // clear existing data
    await Quote.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // users — new User().save() triggers bcrypt pre-save hook
    const resident = new User({ fullName: 'Alice Resident', email: 'resident@test.com', passwordHash: 'password123', role: 'resident' });
    await resident.save();

    const provider1 = new User({ fullName: 'Bob Provider', email: 'provider1@test.com', passwordHash: 'password123', role: 'provider' });
    await provider1.save();

    const provider2 = new User({ fullName: 'Carol Provider', email: 'provider2@test.com', passwordHash: 'password123', role: 'provider' });
    await provider2.save();

    console.log('Created users');

    // categories
    const [plumbing, electrical] = await Category.insertMany([
        { name: 'plumbing', description: 'pipes, leaks, drains' },
        { name: 'electrical', description: 'wiring, outlets, fixtures' },
        { name: 'cleaning', description: 'general cleaning services' }
    ]);
    console.log('Created categories');

    // service requests
    const openRequest = new ServiceRequest({
        title: 'Kitchen faucet is leaking',
        description: 'The kitchen faucet has been dripping constantly for the past week. Water bill is going up.',
        categoryId: plumbing._id,
        createdBy: resident._id,
        location: 'Unit 4B, Kitchen',
        status: 'open'
    });
    await openRequest.save();

    const quotedRequest = new ServiceRequest({
        title: 'Bedroom light fixture not working',
        description: 'The ceiling light in the master bedroom stopped working. Already replaced the bulb but still no power.',
        categoryId: electrical._id,
        createdBy: resident._id,
        location: 'Unit 4B, Master Bedroom',
        status: 'quoted'
    });
    await quotedRequest.save();
    console.log('Created service requests');

    // quotes on the quoted request
    const quote1 = new Quote({
        requestId: quotedRequest._id,
        providerId: provider1._id,
        price: 120,
        message: 'I can fix this within the day. Will bring all necessary tools and parts.',
        daysToComplete: 1
    });
    await quote1.save();

    const quote2 = new Quote({
        requestId: quotedRequest._id,
        providerId: provider2._id,
        price: 95,
        message: 'Likely a wiring issue. I have 5 years of experience with residential electrical work.',
        daysToComplete: 1
    });
    await quote2.save();
    console.log('Created quotes');

    console.log('\nSeed complete. Test accounts:');
    console.log('  resident@test.com  / password123  (resident)');
    console.log('  provider1@test.com / password123  (provider)');
    console.log('  provider2@test.com / password123  (provider)');

    await mongoose.disconnect();
};

seed().catch((err) => {
    console.error('Seed failed:', err);
    mongoose.disconnect();
    process.exit(1);
});
