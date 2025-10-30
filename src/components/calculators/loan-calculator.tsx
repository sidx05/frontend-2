"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface LoanCalculatorProps {
  type: 'personal' | 'education' | 'car' | 'home';
  onClose: () => void;
}

const loanConfig = {
  personal: {
    title: 'Personal Loan EMI Calculator',
    icon: '👤',
    color: 'from-blue-500 to-blue-600',
    maxAmount: 5000000,
    maxTenure: 7,
    defaultRate: 10.5
  },
  education: {
    title: 'Education Loan EMI Calculator',
    icon: '🎓',
    color: 'from-green-500 to-green-600',
    maxAmount: 10000000,
    maxTenure: 15,
    defaultRate: 8.5
  },
  car: {
    title: 'Car Loan EMI Calculator',
    icon: '🚗',
    color: 'from-purple-500 to-purple-600',
    maxAmount: 10000000,
    maxTenure: 7,
    defaultRate: 9.0
  },
  home: {
    title: 'Home Loan EMI Calculator',
    icon: '🏠',
    color: 'from-orange-500 to-orange-600',
    maxAmount: 50000000,
    maxTenure: 30,
    defaultRate: 8.5
  }
};

export default function LoanCalculator({ type, onClose }: LoanCalculatorProps) {
  const config = loanConfig[type];
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenure, setTenure] = useState(5);
  const [interestRate, setInterestRate] = useState(config.defaultRate);

  // Calculate EMI
  const calculateEMI = () => {
    const principal = loanAmount;
    const ratePerMonth = interestRate / 12 / 100;
    const numberOfMonths = tenure * 12;
    
    const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, numberOfMonths)) / 
                (Math.pow(1 + ratePerMonth, numberOfMonths) - 1);
    
    return isNaN(emi) ? 0 : emi;
  };

  const emi = calculateEMI();
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmount;
  const principalPercentage = (loanAmount / totalPayment) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className={`bg-gradient-to-r ${config.color} text-white relative px-6 py-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{config.icon}</span>
              <CardTitle className="text-2xl">{config.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Inputs */}
            <div className="space-y-6">
              {/* Loan Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-foreground">Loan Amount (₹):</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-32 px-3 py-1 border rounded-md text-right"
                  />
                </div>
                <input
                  type="range"
                  min="50000"
                  max={config.maxAmount}
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>₹ 50k</span>
                  <span>₹ {(config.maxAmount / 100000).toFixed(0)}lac</span>
                </div>
              </div>

              {/* Tenure */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-foreground">Tenure (Years):</label>
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-32 px-3 py-1 border rounded-md text-right"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max={config.maxTenure}
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>{config.maxTenure}</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-foreground">Interest Rate (% P.A.):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-32 px-3 py-1 border rounded-md text-right"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            {/* Right Side - Results */}
            <div className="space-y-6">
              {/* EMI Display */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">Monthly EMI:</div>
                <div className="text-3xl font-bold text-primary">
                  ₹ {emi.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Principal Amount:</span>
                  <span className="text-lg font-bold text-yellow-600">
                    ₹ {loanAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Total Interest:</span>
                  <span className="text-lg font-bold text-red-600">
                    ₹ {totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Total Payment:</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹ {totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Principal */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="20"
                      strokeDasharray={`${principalPercentage * 2.51} ${(100 - principalPercentage) * 2.51}`}
                    />
                    {/* Interest */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="20"
                      strokeDasharray={`${(100 - principalPercentage) * 2.51} ${principalPercentage * 2.51}`}
                      strokeDashoffset={`${-principalPercentage * 2.51}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-sm font-bold">
                        {(totalPayment / 100000).toFixed(1)}L
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-xs">Principal Amount</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-600"></div>
                  <span className="text-xs">Interest Amount</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
