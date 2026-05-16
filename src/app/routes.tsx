import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/dashboard";
import DashboardLayout from "../layouts/Dashboard/DashboardLayout";
import RolesPage from "../features/role/pages/Roles";
import Menu from "../features/menu/pages/Menu";
import RegionPage from "../features/crm/region/Region";
import ZonePage from "../features/crm/zone/Zone";
import SubZonePage from "../features/crm/sub-zone/Sub-Zone";
import LeadsPage from "../features/crm/leads/Leads";
import QuotationPage from "../features/sales/quotation/Quotation";
import SalesOrderPage from "../features/sales/sales-order/SalesOrder";
import TaxInvoicePage from "../features/sales/tax-invoice/TaxInvoice";
import DepartmentPage from "../features/masters/department/Department";
import PlantUnitPage from "../features/masters/store/plant-units/PlantUnits";
import WarehousePage from "../features/masters/store/warehouse/Warehouse";
import PartyGroupPage from "../features/masters/party-groups/PartyGroups";
import BanksPage from "../features/masters/banks/Banks";
import PaymentTermsPage from "../features/masters/payment-terms/PaymentTerms";
import CompanyDetailsPage from "../features/masters/company-details/CompanyDetails";
import UsersPage from "../features/masters/users/Users";
import SuppliersPage from "../features/masters/suppliers/Suppliers";
import CustomerPage from "../features/masters/customer/Customer";
import HSNPage from "../features/item-master/hsn/HSN";
import ClassificationPage from "../features/item-master/classification/classification";
import CategoryPage from "../features/item-master/category/category";
import GroupPage from "../features/item-master/group/group";
import SubGroupPage from "../features/item-master/sub-group/sub-group";
import RawMaterialPage from "../features/item-master/raw-material/raw-material";
import ItemPage from "../features/item-master/item/item";
import PurchaseIndentPage from "../features/purchase/purchase-indent/PurchaseIndent";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<DashboardLayout />}>
                    <Route path="admin-masters">
                        <Route path="roles" element={<RolesPage />} />
                        <Route path="menus" element={<Menu />} />
                    </Route>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="crm">
                        <Route path="region" element={<RegionPage />} />
                        <Route path="zone" element={<ZonePage />} />
                        <Route path="sub-zone" element={<SubZonePage />} />
                        <Route path="leads" element={<LeadsPage />} />
                    </Route>
                    <Route path="sales">
                        <Route path="quotation" element={<QuotationPage />} />
                        <Route path="sales-order" element={<SalesOrderPage />} />
                        <Route path="tax-invoice" element={<TaxInvoicePage />} />
                    </Route>
                    <Route path="master">
                        <Route path="party-groups" element={<PartyGroupPage />} />
                        <Route path="department" element={<DepartmentPage />} />
                        <Route path="banks" element={<BanksPage />} />
                        <Route path="payment-terms" element={<PaymentTermsPage />} />
                        <Route path="company-details" element={<CompanyDetailsPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="store">
                            <Route path="plant-units" element={<PlantUnitPage />} />
                            <Route path="warehouse" element={<WarehousePage />} />
                        </Route>
                        <Route path="supplier" element={<SuppliersPage />} />
                        <Route path="customers" element={<CustomerPage />} />
                    </Route>
                    <Route path="item-master">
                        <Route path="hsn" element={<HSNPage />} />
                        <Route path="classification" element={<ClassificationPage />} />
                        <Route path="category" element={<CategoryPage />} />
                        <Route path="group" element={<GroupPage />} />
                        <Route path="sub-group" element={<SubGroupPage />} />
                        <Route path="raw-material" element={<RawMaterialPage />} />
                        <Route path="item" element={<ItemPage />} />
                    </Route>
                    <Route path="purchase">
                        <Route path="purchase-indent" element={<PurchaseIndentPage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}