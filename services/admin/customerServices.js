import User from "../../models/userSchema.js";
import Orders from "../../models/orderSchema.js";

export const getCustomers = async (search, page, limit = 3) => {
  const query = {
    isAdmin: false,
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  };

  const users = await User.find(query)
    .limit(limit)
    .skip((page - 1) * limit);

  const count = await User.countDocuments(query);

  return {
    users,
    totalPages: Math.ceil(count / limit)
  };
};
export const setCustomerBlockStatus = async (id, status) => {
  if (!id) throw new Error("Invalid user id");

  await User.updateOne(
    { _id: id },
    { $set: { isBlocked: status } }
  );
};
export const getCustomerDetails = async (customerId) => {
  const customer = await User.findById(customerId);
  if (!customer) throw new Error("Customer not found");

  const orders = await Orders.find({ userId: customerId });

  const totalOrders = orders.length;
  const totalBalance = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  return {
    customer,
    orders,
    totalOrders,
    totalBalance
  };
};