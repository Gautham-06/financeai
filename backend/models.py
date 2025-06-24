from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class BankTransaction(Base):
    __tablename__ = 'bank_transactions'
    id = Column(Integer, primary_key=True)
    transaction_number = Column(String)
    date = Column(String)
    amount = Column(Float)
    description = Column(String)

class Bill(Base):
    __tablename__ = 'bills'
    id = Column(Integer, primary_key=True)
    bill_number = Column(String)
    date = Column(String)
    amount = Column(Float)
    linked_transaction_id = Column(Integer, ForeignKey('bank_transactions.id'))

class Invoice(Base):
    __tablename__ = 'invoices'
    id = Column(Integer, primary_key=True)
    invoice_number = Column(String)
    date = Column(String)
    amount = Column(Float)
    linked_transaction_id = Column(Integer, ForeignKey('bank_transactions.id')) 