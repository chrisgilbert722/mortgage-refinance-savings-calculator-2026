import { useState } from 'react';

interface RefinanceInput {
    currentBalance: number;
    currentRate: number;
    newRate: number;
    remainingTerm: number;
    closingCosts: number;
}

const REFINANCE_TIPS: string[] = [
    'Compare rates from multiple lenders before refinancing',
    'Consider both monthly savings and total interest paid',
    'Factor in closing costs when calculating break-even',
    'Check if your current loan has prepayment penalties'
];

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function App() {
    const [values, setValues] = useState<RefinanceInput>({ currentBalance: 300000, currentRate: 6.5, newRate: 5.5, remainingTerm: 25, closingCosts: 5000 });
    const handleChange = (field: keyof RefinanceInput, value: number) => setValues(prev => ({ ...prev, [field]: value }));

    // Calculate monthly payments using amortization formula
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const calcMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
        const monthlyRate = annualRate / 100 / 12;
        const totalPayments = years * 12;
        if (monthlyRate <= 0) return principal / totalPayments;
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    };

    const currentMonthly = calcMonthlyPayment(values.currentBalance, values.currentRate, values.remainingTerm);
    const newMonthly = calcMonthlyPayment(values.currentBalance, values.newRate, values.remainingTerm);
    const monthlySavings = Math.round(currentMonthly - newMonthly);

    const totalMonths = values.remainingTerm * 12;
    const currentTotalCost = Math.round(currentMonthly * totalMonths);
    const newTotalCost = Math.round(newMonthly * totalMonths) + values.closingCosts;

    const lifetimeSavings = Math.max(0, currentTotalCost - newTotalCost);
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(values.closingCosts / monthlySavings) : 0;

    const breakdownData = [
        { label: 'Current Loan Total Cost', value: fmt(currentTotalCost), isTotal: false },
        { label: 'New Loan Total Cost', value: fmt(newTotalCost), isTotal: false },
        { label: 'Net Lifetime Savings', value: fmt(lifetimeSavings), isTotal: true }
    ];

    return (
        <main style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <header style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>Mortgage Refinance Savings Calculator (2026)</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>Estimate potential savings from refinancing</p>
            </header>

            <div className="card">
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label htmlFor="currentBalance">Current Loan Balance ($)</label>
                            <input id="currentBalance" type="number" min="10000" max="2000000" step="5000" value={values.currentBalance || ''} onChange={(e) => handleChange('currentBalance', parseInt(e.target.value) || 0)} placeholder="300000" />
                        </div>
                        <div>
                            <label htmlFor="remainingTerm">Remaining Term (Years)</label>
                            <input id="remainingTerm" type="number" min="1" max="30" step="1" value={values.remainingTerm || ''} onChange={(e) => handleChange('remainingTerm', parseInt(e.target.value) || 0)} placeholder="25" />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label htmlFor="currentRate">Current Interest Rate (%)</label>
                            <input id="currentRate" type="number" min="0" max="15" step="0.125" value={values.currentRate || ''} onChange={(e) => handleChange('currentRate', parseFloat(e.target.value) || 0)} placeholder="6.5" />
                        </div>
                        <div>
                            <label htmlFor="newRate">New Interest Rate (%)</label>
                            <input id="newRate" type="number" min="0" max="15" step="0.125" value={values.newRate || ''} onChange={(e) => handleChange('newRate', parseFloat(e.target.value) || 0)} placeholder="5.5" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="closingCosts">Estimated Closing Costs ($)</label>
                        <input id="closingCosts" type="number" min="0" max="50000" step="500" value={values.closingCosts || ''} onChange={(e) => handleChange('closingCosts', parseInt(e.target.value) || 0)} placeholder="5000" />
                    </div>
                    <button className="btn-primary" type="button">Calculate Savings</button>
                </div>
            </div>

            <div className="card results-panel">
                <div className="text-center">
                    <h2 className="result-label" style={{ marginBottom: 'var(--space-2)' }}>Estimated Monthly Savings</h2>
                    <div className="result-hero">{fmt(Math.max(0, monthlySavings))}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>per month</div>
                </div>
                <hr className="result-divider" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', textAlign: 'center' }}>
                    <div>
                        <div className="result-label">Break-Even Time</div>
                        <div className="result-value">{breakEvenMonths > 0 ? `${breakEvenMonths} months` : 'N/A'}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #BAE6FD', paddingLeft: 'var(--space-4)' }}>
                        <div className="result-label">Lifetime Savings</div>
                        <div className="result-value" style={{ color: lifetimeSavings > 0 ? '#16A34A' : 'var(--color-text-primary)' }}>{fmt(lifetimeSavings)}</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)' }}>Refinance Considerations</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
                    {REFINANCE_TIPS.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0 }} />{item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="ad-container"><span>Advertisement</span></div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1rem' }}>Cost Breakdown</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
                    <tbody>
                        {breakdownData.map((row, i) => (
                            <tr key={i} style={{ borderBottom: i === breakdownData.length - 1 ? 'none' : '1px solid var(--color-border)', backgroundColor: row.isTotal ? '#F0F9FF' : (i % 2 ? '#F8FAFC' : 'transparent') }}>
                                <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-text-secondary)', fontWeight: row.isTotal ? 600 : 400 }}>{row.label}</td>
                                <td style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontWeight: 600, color: row.isTotal ? '#16A34A' : 'var(--color-text-primary)' }}>{row.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <p>This calculator provides estimates of potential refinance savings based on the inputs provided. Actual savings depend on loan terms, lender fees, and market conditions. The figures shown are estimates only and do not constitute a loan offer or financial advice. Closing costs and rates vary by lender. Consult a mortgage professional for personalized guidance and accurate quotes.</p>
            </div>

            <footer style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-8)' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-4)', fontSize: '0.875rem' }}>
                    <li>• Estimates only</li><li>• Simplified assumptions</li><li>• Free to use</li>
                </ul>
                <p style={{ marginTop: 'var(--space-4)', fontSize: '0.75rem' }}>&copy; 2026 Mortgage Refinance Calculator</p>
            </footer>

            <div className="ad-container ad-sticky"><span>Advertisement</span></div>
        </main>
    );
}

export default App;
