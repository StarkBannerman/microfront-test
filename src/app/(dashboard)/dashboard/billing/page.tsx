'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import axiosInstance from '@/lib/axios'
import { useSession } from 'next-auth/react'
import { NoAccess } from '@/components/common/NoAccess'

const plans = [
  { id: '20-plan', name: '20-plan', price: 20 },
  { id: '50-plan', name: '50-plan', price: 50 },
  { id: '100-plan', name: '100-plan', price: 100 },
  { id: '200-plan', name: '200-plan', price: 200 },
  { id: '500-plan', name: '500-plan', price: 500 },
  { id: '1000-plan', name: '1000-plan', price: 1000 },
]

interface CreditTransaction {
  credits: string
  instanceId: string
  invoiceId: string
  operationTimeStamp: string
  vendorProductId: string
  _id: string
}

interface DebitTransaction {
  channel: string
  debitAmount: number
  instanceId: string
  messageId: string
  messageType: string
  operationalTimestamp: string
  _id: string
}

interface Transaction {
  date: string
  type: 'credit' | 'debit'
  amount: number
  details: CreditTransaction | DebitTransaction
}

interface BalanceResponse {
  organizationName: string
  balance: string
}

interface BillingPermissions {
  VIEW_BILLING_LOGS?: boolean
  MANAGE_BILLING?: boolean
}

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [transactionType, setTransactionType] = useState<
    'all' | 'credit' | 'debit'
  >('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [organizationName, setOrganizationName] = useState<string>('')
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const { data: session, status } = useSession()
  const billingPermissions: BillingPermissions | undefined =
    session &&
    'permissions' in session &&
    typeof session.permissions === 'object' &&
    session.permissions !== null &&
    'SETTINGS' in session.permissions &&
    typeof session.permissions.SETTINGS === 'object' &&
    session.permissions.SETTINGS !== null &&
    'BILLING' in session.permissions.SETTINGS
      ? (session.permissions.SETTINGS.BILLING as BillingPermissions)
      : undefined
  const isMainAccount =
    session && 'isMainAccount' in session ? session.isMainAccount : false
  const itemsPerPage = 5

  const getBalance = async () => {
    try {
      const response = await axiosInstance.post(`/api/billing/get-balance`)
      return response.data
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [historyResponse, balanceData] = await Promise.all([
          axiosInstance.post('/api/billing/get-history'),
          getBalance(),
        ])

        const { debitHistory, creditHistory } = historyResponse.data
        const { organizationName, balance } = balanceData

        setOrganizationName(organizationName)
        setBalance(parseFloat(balanceData.balance) || 0)

        const formattedTransactions: Transaction[] = [
          ...creditHistory.map((credit: CreditTransaction) => ({
            date: new Date(
              parseInt(credit.operationTimeStamp),
            ).toLocaleDateString(),
            type: 'credit' as const,
            amount: parseFloat(credit.credits),
            details: credit,
          })),
          ...debitHistory.map((debit: DebitTransaction) => ({
            date: new Date(debit.operationalTimestamp).toLocaleDateString(),
            type: 'debit' as const,
            amount: debit.debitAmount,
            details: debit,
          })),
        ].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )

        setTransactions(formattedTransactions)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    ;(isMainAccount || billingPermissions?.VIEW_BILLING_LOGS) && fetchData()
  }, [isMainAccount, billingPermissions])

  const filteredTransactions = transactions.filter((transaction) =>
    transactionType === 'all' ? true : transaction.type === transactionType,
  )

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handlePurchasePlan = async (
    planId: string,
    planName: string,
    planPrice: number,
  ) => {
    try {
      setIsPurchasing(true)
      const response = await axiosInstance.post(`api/billing/purchase-plan`, {
        planId,
        planName,
        planPrice,
      })
      if (response.status === 200 && response.data.checkoutUrl) {
        window.open(response.data.checkoutUrl)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsPurchasing(false)
    }
  }

  return isMainAccount || billingPermissions?.VIEW_BILLING_LOGS ? (
    <div className="h-[calc(100vh-4rem)] p-6 flex flex-col gap-6 overflow-auto">
      {/* Balance Card */}
      <Card className="bg-black text-white">
        <CardContent className="p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="text-lg font-medium">{organizationName}</div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-gray-400 text-sm">Available Balance</div>
                <div className="text-3xl font-bold mt-0.5">
                  ${parseFloat(balance.toString()).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Add Funds Section */}
            {(isMainAccount || billingPermissions?.MANAGE_BILLING) && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-white/10">
                <Select
                  value={selectedPlan || ''}
                  onValueChange={(value) => setSelectedPlan(value)}
                >
                  <SelectTrigger className="w-[140px] bg-gray-800 text-white border-gray-700">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        ${plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full sm:w-auto bg-white text-black hover:bg-gray-200"
                  onClick={() => {
                    if (selectedPlan) {
                      const plan = plans.find((p) => p.id === selectedPlan)
                      if (plan) {
                        handlePurchasePlan(plan.id, plan.name, plan.price)
                      }
                    }
                  }}
                  disabled={!selectedPlan || isPurchasing}
                >
                  {isPurchasing ? 'Processing...' : 'Purchase Plan'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-4 sm:p-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <Select
              value={transactionType}
              onValueChange={(value: 'all' | 'credit' | 'debit') => {
                setTransactionType(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="credit">Credits Only</SelectItem>
                <SelectItem value="debit">Debits Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading transactions...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-gray-600 font-medium">
                      ID
                    </TableHead>
                    <TableHead className="text-gray-600 font-medium">
                      Date
                    </TableHead>
                    <TableHead className="text-gray-600 font-medium">
                      Type
                    </TableHead>
                    <TableHead className="text-gray-600 font-medium text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-transparent border-t border-gray-100"
                    >
                      <TableCell className="font-medium py-4">
                        {transaction.type === 'debit'
                          ? transaction.details._id
                          : (transaction.details as CreditTransaction)
                              .vendorProductId}
                      </TableCell>
                      <TableCell className="font-medium py-4">
                        {transaction.date}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            transaction.type === 'credit'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {transaction.type}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium
                        ${
                          transaction.type === 'credit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(
                currentPage * itemsPerPage,
                filteredTransactions.length,
              )}{' '}
              of {filteredTransactions.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ) : (
    <NoAccess />
  )
}
