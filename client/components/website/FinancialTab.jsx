import React from 'react';

const translateSellOption = (val) => {
  if (!val) return '';
  const key = String(val).trim().toLowerCase();
  const map = {
    'long term rental': 'Wynajem długoterminowy',
    'leasing': 'Leasing',
    'loan': 'Kredyt',
  };
  return map[key] || val;
};

const translateInvoiceOption = (val) => {
  if (!val) return '';
  const key = String(val).trim().toLowerCase();
  const map = {
    invoice: 'Faktura',
    'selling agreement': 'Umowa sprzedaży',
    'invoice vat 23%': 'Faktura VAT 23%',
    'invoice vat margin': 'Faktura VAT marża',
  };
  return map[key] || val;
};

const translateSellerType = (val) => {
  if (!val) return '';
  const key = String(val).trim().toLowerCase();
  const map = {
    company: 'Firma',
    private: 'Osoba prywatna',
  };
  return map[key] || val;
};

const FinancialTab = ({ financialInfo }) => {
  if (!financialInfo) return null;

  return (
    <div className="w-full">
      <p className="text-[15px] sm:text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed">
        Dostępne opcje sprzedaży to {financialInfo.sellOptions?.map(opt => translateSellOption(opt)).join(", ") || "-"}.
        Rodzaj dokumentu sprzedaży: {financialInfo.invoiceOptions?.map(opt => translateInvoiceOption(opt)).join(", ") || "-"}.
        Sprzedający to {translateSellerType(financialInfo.sellerType) || "-"}.
      </p>
    </div>
  );
};

export default FinancialTab;
