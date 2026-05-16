import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import Table from '../../../components/Table/Table';
import { getQuotations, getQuotationById, createQuotation, updateQuotation, deleteQuotation } from './Quotation.api';
import { getCustomers } from '../../masters/customer/Customer.api';
import { getPaymentTerms } from '../../masters/payment-terms/PaymentTerms.api';
import { getBanks } from '../../masters/banks/Banks.api';
import { getItems } from '../../item-master/item/item.api';
import QuotationForm from './QuotationForm';
import './Quotation.css';

export default function QuotationPage() {
  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [contactPersons, setContactPersons] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const tableConfig = [
    { title: 'Quote #', key: 'id' },
    { title: 'Customer', key: 'customer.companyName' },
    { title: 'Quote Date', key: 'quoteDate', render: (value: any) => new Date(value).toLocaleDateString() },
    { title: 'Expiry Date', key: 'expiryDate', render: (value: any) => new Date(value).toLocaleDateString() },
    { title: 'Quote Type', key: 'quoteType' },
    { title: 'Gross Amount', key: 'grossAmount', render: (value: any) => `₹${value.toFixed(2)}` },
    { title: 'Grand Total', key: 'grandTotal', render: (value: any) => `₹${value.toFixed(2)}` },
    { 
      title: 'Actions', 
      render: (row: any) => (
        <div>
          <Button 
            label="Edit" 
            onClick={() => handleEdit(row.id)}
            className="btn-sm btn-warning"
          />
          <Button 
            label="Delete" 
            onClick={() => handleDelete(row.id)}
            className="btn-sm btn-danger ms-2"
          />
          <Button 
            label="View" 
            onClick={() => handleView(row.id)}
            className="btn-sm btn-info ms-2"
          />
        </div>
      )
    }
  ];

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      setTableData(data.data || []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data || []);
      // Extract contact persons from customers
      const allContactPersons: any[] = [];
      response.data?.forEach((customer: any) => {
        if (customer.contactPersons) {
          allContactPersons.push(...customer.contactPersons);
        }
      });
      setContactPersons(allContactPersons);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchPaymentTerms = async () => {
    try {
      const response = await getPaymentTerms();
      setPaymentTerms(response.data || []);
    } catch (error) {
      console.error('Error fetching payment terms:', error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await getBanks();
      setBankAccounts(response.data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await getItems();
      setItems(response.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
    fetchPaymentTerms();
    fetchBankAccounts();
    fetchItems();
  }, []);

  const handleCreate = () => {
    setEditingQuotation(null);
    setShow(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await getQuotationById(id);
      setEditingQuotation(response.data);
      setShow(true);
    } catch (error) {
      console.error('Error fetching quotation:', error);
    }
  };

  const handleView = (id: number) => {
    // In a real app, this would navigate to a detailed view page
    console.log('View quotation:', id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await deleteQuotation(id);
        alert('Quotation deleted successfully');
        fetchQuotations();
      } catch (error) {
        console.error('Error deleting quotation:', error);
        alert('Error deleting quotation');
      }
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingQuotation?.id) {
        await updateQuotation(editingQuotation.id, formData);
        alert('Quotation updated successfully');
      } else {
        await createQuotation(formData);
        alert('Quotation created successfully');
      }
      setShow(false);
      setEditingQuotation(null);
      fetchQuotations();
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Error saving quotation');
    }
  };

  return (
    <div className="quotation-page">
      <div className="page-header mb-4">
        <h2>Quotation</h2>
        <Button
          label="+ Create New Quotation"
          onClick={handleCreate}
          className="btn-primary"
        />
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <Table data={tableData} config={tableConfig} />
      )}

      <QuotationForm
        show={show}
        onHide={() => setShow(false)}
        onSubmit={handleSubmit}
        initialData={editingQuotation}
        customers={customers}
        contactPersons={contactPersons}
        paymentTerms={paymentTerms}
        bankAccounts={bankAccounts}
        items={items}
      />
    </div>
  );
}
