import {
  getCustomers,
  setCustomerBlockStatus,
  getCustomerDetails
} from "../../services/admin/customerServices.js"
 const customerInfo = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;

    const { users, totalPages } =
      await getCustomers(search, page);

    res.render("admin/customers", {
      data: users,
      totalPages,
      currentPage: page,
      search
    });
  } catch (error) {
    console.error("Customer Error:", error);
    res.redirect("/admin/pageError");
  }
};
const customerBlocked = async (req, res) => {
  try {
    const { id, page = 1, search = "" } = req.query;

    await setCustomerBlockStatus(id, true);

    res.redirect(`/admin/customers?page=${page}&search=${search}`);
  } catch (error) {
    console.error(error);
    res.redirect("/admin/pageError");
  }
};
const customerUnBlocked = async (req, res) => {
  try {
    const { id, page = 1, search = "" } = req.query;

    await setCustomerBlockStatus(id, false);

    res.redirect(`/admin/customers?page=${page}&search=${search}`);
  } catch (error) {
    console.error(error);
    res.redirect("/admin/pageError");
  }
};
 const viewCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    const {
      customer,
      orders,
      totalOrders,
      totalBalance
    } = await getCustomerDetails(customerId);

    res.render("admin/customerView", {
      customer,
      orders,
      totalOrders,
      totalBalance
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/pageError");
  }
};
export{
  customerInfo,
  customerBlocked,
  customerUnBlocked,
  viewCustomer
}