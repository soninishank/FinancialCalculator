'use client';

import React from 'react';

const STORAGE_KEY = 'fincalc_money_os_v1';

const DEFAULT_STATE = {
    accounts: [
        { id: 'a1', name: 'Checking', type: 'cash', balance: 2500 },
        { id: 'a2', name: 'Credit Card', type: 'liability', balance: -600 }
    ],
    transactions: [],
    budgets: [
        { id: 'b1', category: 'Housing', limit: 1500 },
        { id: 'b2', category: 'Food', limit: 500 },
        { id: 'b3', category: 'Transport', limit: 250 }
    ],
    subscriptions: [],
    recurring: [],
    goals: [],
    budgetCarryovers: {},
    lastRolloverMonth: '',
    lockedMonths: {},
    autopilotSchedule: {
        enabled: false,
        nextRunDate: todayStr(),
        runRecurring: true,
        runDebt: true,
        runGoals: true
    },
    executionLogs: [],
    reconciliation: {},
    auditTrail: [],
    rules: [
        { id: 'r1', contains: 'uber', category: 'Transport', type: 'expense', mode: 'contains', priority: 1 },
        { id: 'r2', contains: 'netflix', category: 'Entertainment', type: 'expense', mode: 'contains', priority: 1 },
        { id: 'r3', contains: 'salary', category: 'Income', type: 'income', mode: 'contains', priority: 1 }
    ]
};

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function loadState() {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_STATE;
        const parsed = JSON.parse(raw);
        return {
            ...DEFAULT_STATE,
            ...parsed,
            accounts: Array.isArray(parsed.accounts) ? parsed.accounts : DEFAULT_STATE.accounts,
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
            budgets: Array.isArray(parsed.budgets) ? parsed.budgets : DEFAULT_STATE.budgets,
            subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
            recurring: Array.isArray(parsed.recurring) ? parsed.recurring : [],
            goals: Array.isArray(parsed.goals) ? parsed.goals : [],
            budgetCarryovers: parsed.budgetCarryovers && typeof parsed.budgetCarryovers === 'object' ? parsed.budgetCarryovers : {},
            lastRolloverMonth: typeof parsed.lastRolloverMonth === 'string' ? parsed.lastRolloverMonth : '',
            lockedMonths: parsed.lockedMonths && typeof parsed.lockedMonths === 'object' ? parsed.lockedMonths : {},
            autopilotSchedule: parsed.autopilotSchedule && typeof parsed.autopilotSchedule === 'object'
                ? { ...DEFAULT_STATE.autopilotSchedule, ...parsed.autopilotSchedule }
                : DEFAULT_STATE.autopilotSchedule,
            executionLogs: Array.isArray(parsed.executionLogs) ? parsed.executionLogs : [],
            reconciliation: parsed.reconciliation && typeof parsed.reconciliation === 'object' ? parsed.reconciliation : {},
            auditTrail: Array.isArray(parsed.auditTrail) ? parsed.auditTrail : [],
            rules: Array.isArray(parsed.rules) ? parsed.rules : DEFAULT_STATE.rules
        };
    } catch {
        return DEFAULT_STATE;
    }
}

function saveState(state) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function money(v) {
    return `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function monthPrefix(dateStr) {
    return String(dateStr || '').slice(0, 7);
}

function parseCsvLine(line) {
    return String(line || '')
        .split(',')
        .map((part) => part.trim().replace(/^"|"$/g, ''));
}

function toDateString(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
}

function getDaysInMonth(monthValue) {
    const [year, month] = String(monthValue).split('-').map(Number);
    return new Date(year, month, 0).getDate();
}

function weekdayLabels() {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

function addMonths(dateStr, n) {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + n);
    return d.toISOString().slice(0, 10);
}

function addYears(dateStr, n) {
    const d = new Date(dateStr);
    d.setFullYear(d.getFullYear() + n);
    return d.toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
}

function nextRecurringDate(dateStr, frequency) {
    if (frequency === 'weekly') return addDays(dateStr, 7);
    if (frequency === 'yearly') return addYears(dateStr, 1);
    return addMonths(dateStr, 1);
}

function isMonthLocked(state, month) {
    return Boolean(state.lockedMonths && state.lockedMonths[month]);
}

function computeStatementMetrics(state, accountId, month) {
    const account = (state.accounts || []).find((a) => a.id === accountId);
    if (!account || !month) return null;
    const monthStart = `${month}-01`;
    const days = getDaysInMonth(month);
    const monthEnd = `${month}-${String(days).padStart(2, '0')}`;

    const txForAccount = (state.transactions || []).filter((t) => t.accountId === account.id);
    const currentBalance = Number(account.balance || 0);
    const afterMonth = txForAccount.filter((t) => t.date > monthEnd);
    const monthTxs = txForAccount.filter((t) => t.date >= monthStart && t.date <= monthEnd);
    const signedDelta = (t) => (t.type === 'income' ? Number(t.amount || 0) : -Number(t.amount || 0));

    const afterDelta = afterMonth.reduce((sum, t) => sum + signedDelta(t), 0);
    const monthDelta = monthTxs.reduce((sum, t) => sum + signedDelta(t), 0);
    const closing = currentBalance - afterDelta;
    const opening = closing - monthDelta;
    const clearedDelta = monthTxs.filter((t) => t.cleared === true).reduce((sum, t) => sum + signedDelta(t), 0);
    const pendingDelta = monthTxs.filter((t) => t.cleared !== true).reduce((sum, t) => sum + signedDelta(t), 0);

    return {
        accountName: account.name,
        month,
        accountId: account.id,
        opening,
        closing,
        monthDelta,
        clearedDelta,
        pendingDelta,
        txCount: monthTxs.length
    };
}

function computeLeftToAssignForMonth(state, month) {
    const monthTx = (state.transactions || []).filter((t) => monthPrefix(t.date) === month);
    const totalIncome = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const budgetAssigned = (state.budgets || []).reduce((sum, b) => sum + Number(b.limit || 0), 0);
    return totalIncome - budgetAssigned;
}

const CSV_PRESETS = {
    standard: { date: 'date', type: 'type', amount: 'amount', category: 'category', note: 'note', account: 'account', cleared: 'cleared' },
    mint_like: { date: 'date', type: 'transaction type', amount: 'amount', category: 'category', note: 'description', account: 'account name', cleared: 'cleared' },
    ynab_like: { date: 'date', type: 'inflow/outflow', amount: 'amount', category: 'category', note: 'memo', account: 'account', cleared: 'cleared' },
    copilot_like: { date: 'posted date', type: 'type', amount: 'amount', category: 'category', note: 'merchant', account: 'account', cleared: 'status' },
};

const MONEY_OS_SECTIONS = [
    { id: 'overview', label: 'Overview', description: 'Status, health checks, and where to go next.' },
    { id: 'setup', label: 'Setup', description: 'Accounts, budgets, recurring items, and rules.' },
    { id: 'transactions', label: 'Transactions', description: 'Ledger entry, imports, review, and reconciliation.' },
    { id: 'planning', label: 'Planning', description: 'Cashflow and goal progress.' },
    { id: 'automation', label: 'Automation', description: 'Scheduler, autopilot controls, logs, and audit trail.' }
];

export default function MoneyOSPanel() {
    const [state, setState] = React.useState(DEFAULT_STATE);
    const [ready, setReady] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState('overview');

    const [accountForm, setAccountForm] = React.useState({ name: '', type: 'cash', balance: 0 });
    const [transferForm, setTransferForm] = React.useState({
        date: todayStr(),
        fromAccountId: 'a1',
        toAccountId: 'a2',
        amount: '',
        note: ''
    });
    const [txForm, setTxForm] = React.useState({
        date: todayStr(),
        accountId: 'a1',
        type: 'expense',
        amount: '',
        category: 'General',
        note: ''
    });
    const [splitForm, setSplitForm] = React.useState({
        date: todayStr(),
        accountId: 'a1',
        note: ''
    });
    const [splitLines, setSplitLines] = React.useState([
        { id: uid('sline'), type: 'expense', amount: '', category: 'General' },
        { id: uid('sline'), type: 'expense', amount: '', category: 'General' }
    ]);
    const [budgetForm, setBudgetForm] = React.useState({ category: '', limit: '' });
    const [subForm, setSubForm] = React.useState({ name: '', amount: '', billingDay: 1, category: 'Software' });
    const [ruleForm, setRuleForm] = React.useState({
        contains: '',
        category: '',
        type: 'expense',
        mode: 'contains',
        minAmount: '',
        maxAmount: '',
        priority: 1,
        autoTag: '',
        setCleared: false
    });
    const [recurringForm, setRecurringForm] = React.useState({
        name: '',
        amount: '',
        type: 'expense',
        frequency: 'monthly',
        nextDate: todayStr(),
        accountId: 'a1',
        category: 'General'
    });
    const [csvText, setCsvText] = React.useState('');
    const [csvStatus, setCsvStatus] = React.useState('');
    const [viewMonth, setViewMonth] = React.useState(todayStr().slice(0, 7));
    const [opsStatus, setOpsStatus] = React.useState('');
    const [autopilotForm, setAutopilotForm] = React.useState({
        fromAccountId: 'a1',
        liabilityAccountId: 'a2',
        amountCap: ''
    });
    const [recurringEditId, setRecurringEditId] = React.useState('');
    const [txFilter, setTxFilter] = React.useState({
        query: '',
        accountId: 'all',
        type: 'all',
        cleared: 'all',
        category: ''
    });
    const [txPage, setTxPage] = React.useState(1);
    const [statementForm, setStatementForm] = React.useState({
        accountId: 'a1',
        month: todayStr().slice(0, 7)
    });
    const [selectedTxIds, setSelectedTxIds] = React.useState([]);
    const [txTagInput, setTxTagInput] = React.useState('');
    const [smartView, setSmartView] = React.useState('all');
    const [adjustmentForm, setAdjustmentForm] = React.useState({
        month: todayStr().slice(0, 7),
        accountId: 'a1',
        type: 'expense',
        amount: '',
        note: ''
    });
    const [csvMapping, setCsvMapping] = React.useState({
        date: 'date',
        type: 'type',
        amount: 'amount',
        category: 'category',
        note: 'note',
        account: 'account',
        cleared: 'cleared'
    });
    const [reconcileTarget, setReconcileTarget] = React.useState('');
    const [selectedLogId, setSelectedLogId] = React.useState('');
    const [csvPreviewRows, setCsvPreviewRows] = React.useState([]);
    const [csvPreviewSkipped, setCsvPreviewSkipped] = React.useState(0);
    const [statementCsvText, setStatementCsvText] = React.useState('');
    const [statementStatus, setStatementStatus] = React.useState('');
    const [goalForm, setGoalForm] = React.useState({
        name: '',
        target: '',
        current: '',
        targetDate: addMonths(`${todayStr().slice(0, 7)}-01`, 24),
        autopilotEnabled: true,
        autopilotMonthlyCap: ''
    });
    const [undoStack, setUndoStack] = React.useState([]);
    const [redoStack, setRedoStack] = React.useState([]);

    React.useEffect(() => {
        const loaded = loadState();
        setState(loaded);
        if (loaded.accounts.length > 0) {
            setTxForm((prev) => ({ ...prev, accountId: loaded.accounts[0].id }));
            setSplitForm((prev) => ({ ...prev, accountId: loaded.accounts[0].id }));
            setRecurringForm((prev) => ({ ...prev, accountId: loaded.accounts[0].id }));
            setTransferForm((prev) => ({
                ...prev,
                fromAccountId: loaded.accounts[0].id,
                toAccountId: loaded.accounts[1]?.id || loaded.accounts[0].id
            }));
            setAutopilotForm((prev) => ({
                ...prev,
                fromAccountId: loaded.accounts[0].id,
                liabilityAccountId: loaded.accounts.find((a) => a.type === 'liability')?.id || loaded.accounts[1]?.id || loaded.accounts[0].id
            }));
            setStatementForm((prev) => ({ ...prev, accountId: loaded.accounts[0].id }));
            setAdjustmentForm((prev) => ({ ...prev, accountId: loaded.accounts[0].id }));
        }
        setReady(true);
    }, []);

    React.useEffect(() => {
        if (!ready) return;
        saveState(state);
    }, [state, ready]);

    React.useEffect(() => {
        setTxPage(1);
    }, [txFilter]);

    const commitState = React.useCallback((updater, label = 'update') => {
        setState((prev) => {
            const updated = typeof updater === 'function' ? updater(prev) : updater;
            if (updated === prev) return prev;
            const auditEvent = {
                id: uid('audit'),
                timestamp: new Date().toISOString(),
                action: label
            };
            const next = {
                ...updated,
                auditTrail: [auditEvent, ...((updated.auditTrail || prev.auditTrail || []))].slice(0, 200)
            };
            setUndoStack((stack) => [...stack, prev].slice(-30));
            setRedoStack([]);
            return next;
        });
        setOpsStatus(`Applied: ${label}`);
    }, []);

    const undoLast = () => {
        setUndoStack((stack) => {
            if (!stack.length) return stack;
            const previous = stack[stack.length - 1];
            setRedoStack((redo) => [...redo, state].slice(-30));
            setState(previous);
            setOpsStatus('Undid last action.');
            return stack.slice(0, -1);
        });
    };

    const redoLast = () => {
        setRedoStack((stack) => {
            if (!stack.length) return stack;
            const next = stack[stack.length - 1];
            setUndoStack((undo) => [...undo, state].slice(-30));
            setState(next);
            setOpsStatus('Redid last action.');
            return stack.slice(0, -1);
        });
    };

    const netWorth = React.useMemo(
        () => state.accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0),
        [state.accounts]
    );

    const currentMonth = monthPrefix(todayStr());
    const monthTx = React.useMemo(
        () => state.transactions.filter((t) => monthPrefix(t.date) === currentMonth),
        [state.transactions, currentMonth]
    );
    const selectedMonthTx = React.useMemo(
        () => state.transactions.filter((t) => monthPrefix(t.date) === viewMonth),
        [state.transactions, viewMonth]
    );

    const totalIncome = monthTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalExpense = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const clearedCount = monthTx.filter((t) => t.cleared === true).length;
    const pendingCount = monthTx.filter((t) => t.cleared !== true).length;

    const budgetUtilization = state.budgets.map((b) => {
        const spent = monthTx
            .filter((t) => t.type === 'expense' && t.category === b.category)
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const carry = Number(state.budgetCarryovers?.[`${currentMonth}:${b.category}`] || 0);
        const available = Number(b.limit || 0) + carry;
        const ratio = available > 0 ? spent / available : 0;
        return { ...b, spent, carry, available, ratio };
    });

    const budgetAssigned = state.budgets.reduce((sum, b) => sum + Number(b.limit || 0), 0);
    const leftToAssign = totalIncome - budgetAssigned;

    const monthlySubscriptionCost = state.subscriptions
        .filter((s) => s.active !== false)
        .reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const totalDebt = state.accounts
        .filter((a) => a.type === 'liability' && Number(a.balance || 0) < 0)
        .reduce((sum, a) => sum + Math.abs(Number(a.balance || 0)), 0);

    const upcomingRecurring = state.recurring
        .slice()
        .sort((a, b) => String(a.nextDate).localeCompare(String(b.nextDate)))
        .slice(0, 6);

    const addAccount = (e) => {
        e.preventDefault();
        if (!accountForm.name.trim()) return;
        commitState((prev) => ({
            ...prev,
            accounts: [
                ...prev.accounts,
                {
                    id: uid('acc'),
                    name: accountForm.name.trim(),
                    type: accountForm.type,
                    balance: Number(accountForm.balance || 0)
                }
            ]
        }), 'add account');
        setAccountForm({ name: '', type: 'cash', balance: 0 });
    };

    const addTransfer = (e) => {
        e.preventDefault();
        if (isMonthLocked(state, monthPrefix(transferForm.date))) {
            setOpsStatus(`Transfers are locked for ${monthPrefix(transferForm.date)}.`);
            return;
        }
        const amount = Number(transferForm.amount);
        if (!Number.isFinite(amount) || amount <= 0) return;
        if (!transferForm.fromAccountId || !transferForm.toAccountId) return;
        if (transferForm.fromAccountId === transferForm.toAccountId) return;

        commitState((prev) => {
            const nextAccounts = prev.accounts.map((a) => {
                if (a.id === transferForm.fromAccountId) {
                    return { ...a, balance: Number(a.balance || 0) - amount };
                }
                if (a.id === transferForm.toAccountId) {
                    return { ...a, balance: Number(a.balance || 0) + amount };
                }
                return a;
            });
            const fromName = prev.accounts.find((a) => a.id === transferForm.fromAccountId)?.name || 'From';
            const toName = prev.accounts.find((a) => a.id === transferForm.toAccountId)?.name || 'To';
            const baseNote = transferForm.note.trim() || `${fromName} -> ${toName}`;
            const outTx = {
                id: uid('tx'),
                date: transferForm.date,
                accountId: transferForm.fromAccountId,
                type: 'expense',
                amount,
                category: 'Transfer',
                note: `Transfer out: ${baseNote}`,
                cleared: false
            };
            const inTx = {
                id: uid('tx'),
                date: transferForm.date,
                accountId: transferForm.toAccountId,
                type: 'income',
                amount,
                category: 'Transfer',
                note: `Transfer in: ${baseNote}`,
                cleared: false
            };
            return {
                ...prev,
                accounts: nextAccounts,
                transactions: [inTx, outTx, ...prev.transactions].slice(0, 1000)
            };
        }, 'post transfer');
        setTransferForm((prev) => ({ ...prev, amount: '', note: '' }));
    };

    const applyRule = (note, amount, accountId) => {
        const text = String(note || '');
        const lower = text.toLowerCase();
        const numericAmount = Number(amount || 0);

        const ranked = [...state.rules].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
        for (const rule of ranked) {
            const mode = rule.mode || 'contains';
            const contains = String(rule.contains || '');
            let textMatch = false;
            if (mode === 'regex') {
                try {
                    textMatch = new RegExp(contains, 'i').test(text);
                } catch {
                    textMatch = false;
                }
            } else {
                textMatch = lower.includes(contains.toLowerCase());
            }
            if (!textMatch) continue;

            const minAmount = Number(rule.minAmount);
            const maxAmount = Number(rule.maxAmount);
            if (Number.isFinite(minAmount) && numericAmount < minAmount) continue;
            if (Number.isFinite(maxAmount) && numericAmount > maxAmount) continue;
            if (rule.accountId && rule.accountId !== 'all' && rule.accountId !== accountId) continue;
            return rule;
        }
        return null;
    };

    const addTransaction = (e) => {
        e.preventDefault();
        if (isMonthLocked(state, monthPrefix(txForm.date))) {
            setOpsStatus(`Transactions are locked for ${monthPrefix(txForm.date)}.`);
            return;
        }
        const amount = Number(txForm.amount);
        if (!txForm.accountId || !Number.isFinite(amount) || amount <= 0) return;

        const matchedRule = applyRule(txForm.note, amount, txForm.accountId);
        const category = matchedRule?.category || txForm.category || 'General';
        const type = matchedRule?.type || txForm.type;
        const autoTag = matchedRule?.autoTag ? String(matchedRule.autoTag).trim() : '';
        const setCleared = matchedRule?.setCleared === true;

        const tx = {
            id: uid('tx'),
            date: txForm.date,
            accountId: txForm.accountId,
            type,
            amount,
            category,
            note: txForm.note.trim(),
            cleared: setCleared,
            tags: autoTag ? [autoTag] : []
        };

        commitState((prev) => {
            const nextAccounts = prev.accounts.map((a) => {
                if (a.id !== tx.accountId) return a;
                const nextBalance = type === 'income'
                    ? Number(a.balance || 0) + amount
                    : Number(a.balance || 0) - amount;
                return { ...a, balance: nextBalance };
            });
            return {
                ...prev,
                accounts: nextAccounts,
                transactions: [tx, ...prev.transactions].slice(0, 300)
            };
        }, 'add transaction');

        setTxForm((prev) => ({ ...prev, amount: '', note: '' }));
    };

    const addBudget = (e) => {
        e.preventDefault();
        if (!budgetForm.category.trim()) return;
        const limit = Number(budgetForm.limit);
        if (!Number.isFinite(limit) || limit <= 0) return;
        commitState((prev) => ({
            ...prev,
            budgets: [...prev.budgets, { id: uid('bud'), category: budgetForm.category.trim(), limit }]
        }), 'add budget');
        setBudgetForm({ category: '', limit: '' });
    };

    const addSubscription = (e) => {
        e.preventDefault();
        if (!subForm.name.trim()) return;
        const amount = Number(subForm.amount);
        if (!Number.isFinite(amount) || amount <= 0) return;
        commitState((prev) => ({
            ...prev,
            subscriptions: [
                ...prev.subscriptions,
                {
                    id: uid('sub'),
                    name: subForm.name.trim(),
                    amount,
                    billingDay: Number(subForm.billingDay || 1),
                    category: subForm.category || 'Software',
                    active: true
                }
            ]
        }), 'add subscription');
        setSubForm({ name: '', amount: '', billingDay: 1, category: 'Software' });
    };

    const addRule = (e) => {
        e.preventDefault();
        if (!ruleForm.contains.trim() || !ruleForm.category.trim()) return;
        commitState((prev) => ({
            ...prev,
            rules: [
                ...prev.rules,
                {
                    id: uid('rule'),
                    contains: ruleForm.contains.trim(),
                    category: ruleForm.category.trim(),
                    type: ruleForm.type,
                    mode: ruleForm.mode || 'contains',
                    minAmount: ruleForm.minAmount === '' ? null : Number(ruleForm.minAmount),
                    maxAmount: ruleForm.maxAmount === '' ? null : Number(ruleForm.maxAmount),
                    priority: Number(ruleForm.priority || 1),
                    autoTag: ruleForm.autoTag.trim() || '',
                    setCleared: Boolean(ruleForm.setCleared)
                }
            ]
        }), 'add rule');
        setRuleForm({ contains: '', category: '', type: 'expense', mode: 'contains', minAmount: '', maxAmount: '', priority: 1, autoTag: '', setCleared: false });
    };

    const addRecurring = (e) => {
        e.preventDefault();
        if (!recurringForm.name.trim()) return;
        const amount = Number(recurringForm.amount);
        if (!Number.isFinite(amount) || amount <= 0) return;
        commitState((prev) => {
            const item = {
                id: recurringEditId || uid('rec'),
                name: recurringForm.name.trim(),
                amount,
                type: recurringForm.type,
                frequency: recurringForm.frequency,
                nextDate: recurringForm.nextDate,
                accountId: recurringForm.accountId,
                category: recurringForm.category || 'General'
            };
            if (recurringEditId) {
                return {
                    ...prev,
                    recurring: prev.recurring.map((r) => (r.id === recurringEditId ? item : r))
                };
            }
            return {
                ...prev,
                recurring: [...prev.recurring, item]
            };
        }, recurringEditId ? 'update recurring' : 'add recurring');
        setRecurringForm((prev) => ({ ...prev, name: '', amount: '' }));
        setRecurringEditId('');
    };

    const editRecurring = (id) => {
        const item = state.recurring.find((r) => r.id === id);
        if (!item) return;
        setRecurringEditId(id);
        setRecurringForm({
            name: item.name,
            amount: String(item.amount),
            type: item.type,
            frequency: item.frequency,
            nextDate: item.nextDate,
            accountId: item.accountId,
            category: item.category || 'General'
        });
    };

    const deleteRecurring = (id) => {
        commitState((prev) => ({
            ...prev,
            recurring: prev.recurring.filter((r) => r.id !== id)
        }), 'delete recurring');
        if (recurringEditId === id) {
            setRecurringEditId('');
        }
    };

    const toggleSubscriptionActive = (id) => {
        commitState((prev) => ({
            ...prev,
            subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, active: s.active === false } : s))
        }), 'toggle subscription');
    };

    const deleteSubscription = (id) => {
        commitState((prev) => ({
            ...prev,
            subscriptions: prev.subscriptions.filter((s) => s.id !== id)
        }), 'delete subscription');
    };

    const runDueRecurring = () => {
        const today = todayStr();
        let postedCount = 0;
        let skippedLocked = 0;

        commitState((prev) => {
            const nextAccounts = [...prev.accounts];
            const generatedTx = [];
            const nextRecurring = prev.recurring.map((r) => {
                let nextDate = r.nextDate;
                while (nextDate <= today) {
                    if (isMonthLocked(prev, monthPrefix(nextDate))) {
                        nextDate = nextRecurringDate(nextDate, r.frequency);
                        skippedLocked += 1;
                        continue;
                    }
                    const duplicate = prev.transactions.some(
                        (t) => t.sourceRecurringId === r.id && t.date === nextDate
                    ) || generatedTx.some((t) => t.sourceRecurringId === r.id && t.date === nextDate);
                    if (!duplicate) {
                        const amount = Number(r.amount || 0);
                        const tx = {
                            id: uid('tx'),
                            date: nextDate,
                            accountId: r.accountId,
                            type: r.type,
                            amount,
                            category: r.category || 'General',
                            note: `Recurring: ${r.name}`,
                            sourceRecurringId: r.id,
                            cleared: false
                        };
                        generatedTx.push(tx);
                        const idx = nextAccounts.findIndex((a) => a.id === r.accountId);
                        if (idx >= 0) {
                            const delta = r.type === 'income' ? amount : -amount;
                            nextAccounts[idx] = {
                                ...nextAccounts[idx],
                                balance: Number(nextAccounts[idx].balance || 0) + delta
                            };
                        }
                        postedCount += 1;
                    }
                    nextDate = nextRecurringDate(nextDate, r.frequency);
                }
                return { ...r, nextDate };
            });

            return {
                ...prev,
                accounts: nextAccounts,
                recurring: nextRecurring,
                transactions: [...generatedTx, ...prev.transactions].slice(0, 1000)
            };
        }, 'run due recurring');

        setOpsStatus(`Recurring autopost complete: ${postedCount} created, ${skippedLocked} skipped due to locked month.`);
    };

    const rollOverBudgets = () => {
        if (state.lastRolloverMonth === currentMonth) {
            setOpsStatus('Budget rollover already applied for this month.');
            return;
        }
        commitState((prev) => {
            const nextCarry = { ...(prev.budgetCarryovers || {}) };
            prev.budgets.forEach((b) => {
                const spent = monthTx
                    .filter((t) => t.type === 'expense' && t.category === b.category)
                    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
                const currentKey = `${currentMonth}:${b.category}`;
                const currentCarry = Number(prev.budgetCarryovers?.[currentKey] || 0);
                const remaining = Number(b.limit || 0) + currentCarry - spent;

                const [y, m] = currentMonth.split('-').map(Number);
                const nextMonthDate = new Date(y, m, 1);
                const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
                const nextKey = `${nextMonth}:${b.category}`;
                nextCarry[nextKey] = remaining;
            });
            return {
                ...prev,
                budgetCarryovers: nextCarry,
                lastRolloverMonth: currentMonth
            };
        }, 'rollover budgets');
        setOpsStatus(`Budget rollover applied for ${currentMonth}.`);
    };

    const toggleTransactionCleared = (txId) => {
        const tx = state.transactions.find((t) => t.id === txId);
        if (tx && isMonthLocked(state, monthPrefix(tx.date))) {
            setOpsStatus(`Cannot reconcile: ${monthPrefix(tx.date)} is locked.`);
            return;
        }
        commitState((prev) => ({
            ...prev,
            transactions: prev.transactions.map((t) => (
                t.id === txId ? { ...t, cleared: !t.cleared } : t
            ))
        }), 'toggle cleared');
    };

    const deleteTransaction = (txId) => {
        const tx = state.transactions.find((t) => t.id === txId);
        if (tx && isMonthLocked(state, monthPrefix(tx.date))) {
            setOpsStatus(`Cannot delete: ${monthPrefix(tx.date)} is locked.`);
            return;
        }
        commitState((prev) => {
            const innerTx = prev.transactions.find((t) => t.id === txId);
            if (!innerTx) return prev;
            const nextAccounts = prev.accounts.map((a) => {
                if (a.id !== innerTx.accountId) return a;
                const reverseDelta = innerTx.type === 'income' ? -Number(innerTx.amount || 0) : Number(innerTx.amount || 0);
                return { ...a, balance: Number(a.balance || 0) + reverseDelta };
            });
            return {
                ...prev,
                accounts: nextAccounts,
                transactions: prev.transactions.filter((t) => t.id !== txId)
            };
        }, 'delete transaction');
    };

    const addSplitLine = () => {
        setSplitLines((prev) => [...prev, { id: uid('sline'), type: 'expense', amount: '', category: 'General' }]);
    };

    const updateSplitLine = (lineId, field, value) => {
        setSplitLines((prev) => prev.map((line) => (line.id === lineId ? { ...line, [field]: value } : line)));
    };

    const removeSplitLine = (lineId) => {
        setSplitLines((prev) => prev.filter((line) => line.id !== lineId));
    };

    const addSplitTransaction = (e) => {
        e.preventDefault();
        if (isMonthLocked(state, monthPrefix(splitForm.date))) {
            setOpsStatus(`Split transactions are locked for ${monthPrefix(splitForm.date)}.`);
            return;
        }
        if (!splitForm.accountId) return;
        const normalized = splitLines
            .map((line) => ({
                ...line,
                amount: Number(line.amount)
            }))
            .filter((line) => Number.isFinite(line.amount) && line.amount > 0);
        if (!normalized.length) return;

        const parentId = uid('split');
        commitState((prev) => {
            const totalDelta = normalized.reduce(
                (sum, line) => sum + (line.type === 'income' ? line.amount : -line.amount),
                0
            );
            const nextAccounts = prev.accounts.map((a) => {
                if (a.id !== splitForm.accountId) return a;
                return { ...a, balance: Number(a.balance || 0) + totalDelta };
            });
            const txRows = normalized.map((line) => ({
                id: uid('tx'),
                date: splitForm.date,
                accountId: splitForm.accountId,
                type: line.type,
                amount: line.amount,
                category: line.category || 'General',
                note: splitForm.note.trim() || 'Split transaction',
                parentSplitId: parentId,
                cleared: false
            }));
            return {
                ...prev,
                accounts: nextAccounts,
                transactions: [...txRows, ...prev.transactions].slice(0, 1000)
            };
        }, 'add split transaction');

        setSplitForm((prev) => ({ ...prev, note: '' }));
        setSplitLines([
            { id: uid('sline'), type: 'expense', amount: '', category: 'General' },
            { id: uid('sline'), type: 'expense', amount: '', category: 'General' }
        ]);
    };

    const runDebtAutopilot = () => {
        if (currentMonthLocked) {
            setOpsStatus(`Debt autopilot blocked: ${currentMonth} is locked.`);
            return;
        }
        const source = state.accounts.find((a) => a.id === autopilotForm.fromAccountId);
        const liability = state.accounts.find((a) => a.id === autopilotForm.liabilityAccountId);
        if (!source || !liability) return;
        if (Number(liability.balance || 0) >= 0) {
            setOpsStatus('Debt autopilot skipped: selected liability has no outstanding balance.');
            return;
        }

        const cap = Number(autopilotForm.amountCap);
        const candidate = Number.isFinite(cap) && cap > 0 ? cap : Math.max(0, leftToAssign);
        const sourceAvailable = Math.max(0, Number(source.balance || 0));
        const debtOutstanding = Math.abs(Number(liability.balance || 0));
        const payAmount = Math.min(candidate, sourceAvailable, debtOutstanding);

        if (!Number.isFinite(payAmount) || payAmount <= 0) {
            setOpsStatus('Debt autopilot skipped: no available amount to pay.');
            return;
        }

        commitState((prev) => {
            const nextAccounts = prev.accounts.map((a) => {
                if (a.id === source.id) return { ...a, balance: Number(a.balance || 0) - payAmount };
                if (a.id === liability.id) return { ...a, balance: Number(a.balance || 0) + payAmount };
                return a;
            });
            const outTx = {
                id: uid('tx'),
                date: todayStr(),
                accountId: source.id,
                type: 'expense',
                amount: payAmount,
                category: 'Debt Payment',
                note: `Debt autopilot payment to ${liability.name}`,
                cleared: false
            };
            const inTx = {
                id: uid('tx'),
                date: todayStr(),
                accountId: liability.id,
                type: 'income',
                amount: payAmount,
                category: 'Debt Payment',
                note: `Debt autopilot payment from ${source.name}`,
                cleared: false
            };
            return {
                ...prev,
                accounts: nextAccounts,
                transactions: [inTx, outTx, ...prev.transactions].slice(0, 1000)
            };
        }, 'run debt autopilot');

        setOpsStatus(`Debt autopilot posted ${money(payAmount)} from ${source.name} to ${liability.name}.`);
    };

    const toggleSelectTx = (txId) => {
        setSelectedTxIds((prev) => (prev.includes(txId) ? prev.filter((id) => id !== txId) : [...prev, txId]));
    };

    const toggleSelectPage = () => {
        if (allPageSelected) {
            const pageSet = new Set(txPageRows.map((t) => t.id));
            setSelectedTxIds((prev) => prev.filter((id) => !pageSet.has(id)));
            return;
        }
        setSelectedTxIds((prev) => Array.from(new Set([...prev, ...txPageRows.map((t) => t.id)])));
    };

    const bulkSetCleared = (value) => {
        const selectedSet = new Set(selectedTxIds);
        commitState((prev) => ({
            ...prev,
            transactions: prev.transactions.map((t) => {
                if (!selectedSet.has(t.id)) return t;
                if (isMonthLocked(prev, monthPrefix(t.date))) return t;
                return { ...t, cleared: value };
            })
        }), value ? 'bulk clear' : 'bulk pending');
    };

    const bulkDeleteSelected = () => {
        const selectedSet = new Set(selectedTxIds);
        commitState((prev) => {
            const removable = prev.transactions.filter((t) => selectedSet.has(t.id) && !isMonthLocked(prev, monthPrefix(t.date)));
            const removeIds = new Set(removable.map((t) => t.id));
            const nextAccounts = [...prev.accounts];
            removable.forEach((tx) => {
                const idx = nextAccounts.findIndex((a) => a.id === tx.accountId);
                if (idx >= 0) {
                    const reverseDelta = tx.type === 'income' ? -Number(tx.amount || 0) : Number(tx.amount || 0);
                    nextAccounts[idx] = { ...nextAccounts[idx], balance: Number(nextAccounts[idx].balance || 0) + reverseDelta };
                }
            });
            return {
                ...prev,
                accounts: nextAccounts,
                transactions: prev.transactions.filter((t) => !removeIds.has(t.id))
            };
        }, 'bulk delete');
        setSelectedTxIds([]);
    };

    const mergeDuplicateGroup = (groupKey) => {
        const ids = duplicateGroups.get(groupKey);
        if (!ids || ids.length < 2) return;
        const keepId = ids[0];
        const removeSet = new Set(ids.slice(1));
        commitState((prev) => {
            const removable = prev.transactions.filter((t) => removeSet.has(t.id) && !isMonthLocked(prev, monthPrefix(t.date)));
            const removableIds = new Set(removable.map((t) => t.id));
            const nextAccounts = [...prev.accounts];
            removable.forEach((tx) => {
                const idx = nextAccounts.findIndex((a) => a.id === tx.accountId);
                if (idx >= 0) {
                    const reverseDelta = tx.type === 'income' ? -Number(tx.amount || 0) : Number(tx.amount || 0);
                    nextAccounts[idx] = { ...nextAccounts[idx], balance: Number(nextAccounts[idx].balance || 0) + reverseDelta };
                }
            });
            return {
                ...prev,
                accounts: nextAccounts,
                transactions: prev.transactions.map((t) => (t.id === keepId ? { ...t, note: `${t.note || ''} [merged duplicates]`.trim() } : t))
                    .filter((t) => !removableIds.has(t.id))
            };
        }, 'merge duplicate group');
    };

    const addTagToSelected = () => {
        const tag = txTagInput.trim();
        if (!tag) return;
        const selectedSet = new Set(selectedTxIds);
        commitState((prev) => ({
            ...prev,
            transactions: prev.transactions.map((t) => {
                if (!selectedSet.has(t.id)) return t;
                const tags = Array.isArray(t.tags) ? t.tags : [];
                if (tags.includes(tag)) return t;
                return { ...t, tags: [...tags, tag] };
            })
        }), `add tag ${tag}`);
        setTxTagInput('');
    };

    const closeMonth = (month) => {
        commitState((prev) => ({
            ...prev,
            lockedMonths: { ...(prev.lockedMonths || {}), [month]: true }
        }), `close month ${month}`);
        setOpsStatus(`Closed month ${month}. New edits are blocked.`);
    };

    const reopenMonth = (month) => {
        commitState((prev) => {
            const next = { ...(prev.lockedMonths || {}) };
            delete next[month];
            return { ...prev, lockedMonths: next };
        }, `reopen month ${month}`);
        setOpsStatus(`Reopened month ${month}.`);
    };

    const saveReconcileTarget = () => {
        const parsed = Number(reconcileTarget);
        if (!Number.isFinite(parsed)) return;
        commitState((prev) => ({
            ...prev,
            reconciliation: {
                ...(prev.reconciliation || {}),
                [reconcileKey]: {
                    ...(prev.reconciliation?.[reconcileKey] || {}),
                    targetClosing: parsed,
                    matchedTxIds: prev.reconciliation?.[reconcileKey]?.matchedTxIds || []
                }
            }
        }), 'set reconcile target');
        setReconcileTarget('');
    };

    const toggleStatementMatch = (txId) => {
        commitState((prev) => {
            const current = prev.reconciliation?.[reconcileKey] || { targetClosing: null, matchedTxIds: [] };
            const set = new Set(current.matchedTxIds || []);
            if (set.has(txId)) set.delete(txId); else set.add(txId);
            return {
                ...prev,
                reconciliation: {
                    ...(prev.reconciliation || {}),
                    [reconcileKey]: {
                        ...current,
                        matchedTxIds: Array.from(set)
                    }
                }
            };
        }, 'toggle statement match');
    };

    const applySuggestedMatches = () => {
        if (!suggestedMatchIds.length) return;
        commitState((prev) => {
            const current = prev.reconciliation?.[reconcileKey] || { targetClosing: null, matchedTxIds: [] };
            const merged = new Set([...(current.matchedTxIds || []), ...suggestedMatchIds]);
            return {
                ...prev,
                reconciliation: {
                    ...(prev.reconciliation || {}),
                    [reconcileKey]: {
                        ...current,
                        matchedTxIds: Array.from(merged)
                    }
                }
            };
        }, 'apply suggested matches');
    };

    const importStatementRows = () => {
        const lines = String(statementCsvText || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
            setStatementStatus('Statement import failed: add header + rows.');
            return;
        }
        const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
        const idxDate = header.indexOf('date');
        const idxAmount = header.indexOf('amount');
        const idxDesc = header.indexOf('description');
        if (idxDate < 0 || idxAmount < 0) {
            setStatementStatus('Statement import failed: required columns date,amount.');
            return;
        }

        const rows = [];
        for (let i = 1; i < lines.length; i += 1) {
            const cells = parseCsvLine(lines[i]);
            const date = toDateString(cells[idxDate]);
            const amount = Number(cells[idxAmount]);
            if (!date || !Number.isFinite(amount)) continue;
            rows.push({
                id: uid('stmt'),
                date,
                amount,
                description: idxDesc >= 0 ? String(cells[idxDesc] || '') : '',
                matchedTxId: null
            });
        }

        commitState((prev) => {
            const current = prev.reconciliation?.[reconcileKey] || { targetClosing: null, matchedTxIds: [] };
            return {
                ...prev,
                reconciliation: {
                    ...(prev.reconciliation || {}),
                    [reconcileKey]: {
                        ...current,
                        statementRows: rows
                    }
                }
            };
        }, 'import statement rows');
        setStatementStatus(`Imported ${rows.length} statement rows.`);
        setStatementCsvText('');
    };

    const autoMatchStatementImport = () => {
        const ledger = statementTxRows;
        if (!ledger.length) {
            setStatementStatus('No ledger rows in this statement month/account.');
            return;
        }
        let matchedCount = 0;
        commitState((prev) => {
            const current = prev.reconciliation?.[reconcileKey] || { targetClosing: null, matchedTxIds: [], statementRows: [] };
            const statementRows = Array.isArray(current.statementRows) ? [...current.statementRows] : [];
            const matchedTxIds = new Set(current.matchedTxIds || []);
            const usedTxIds = new Set();

            const pool = prev.transactions.filter((t) => t.accountId === statementForm.accountId && monthPrefix(t.date) === statementForm.month);

            const nextRows = statementRows.map((row) => {
                if (row.matchedTxId) return row;
                const candidate = pool.find((t) => {
                    if (usedTxIds.has(t.id)) return false;
                    if (matchedTxIds.has(t.id)) return false;
                    const signed = t.type === 'income' ? Number(t.amount || 0) : -Number(t.amount || 0);
                    const amountMatch = Math.abs(signed - Number(row.amount || 0)) < 0.01 || Math.abs(Math.abs(signed) - Math.abs(Number(row.amount || 0))) < 0.01;
                    if (!amountMatch) return false;
                    const dt = Math.abs(new Date(t.date).getTime() - new Date(row.date).getTime()) / (1000 * 60 * 60 * 24);
                    return dt <= 2;
                });
                if (!candidate) return row;
                usedTxIds.add(candidate.id);
                matchedTxIds.add(candidate.id);
                matchedCount += 1;
                return { ...row, matchedTxId: candidate.id };
            });
            return {
                ...prev,
                reconciliation: {
                    ...(prev.reconciliation || {}),
                    [reconcileKey]: {
                        ...current,
                        matchedTxIds: Array.from(matchedTxIds),
                        statementRows: nextRows
                    }
                }
            };
        }, 'auto-match statement rows');
        setStatementStatus(`Auto-matched ${matchedCount} statement row(s).`);
    };

    const linkStatementRowToTransaction = (rowId, txId) => {
        if (!rowId || !txId) return;
        commitState((prev) => {
            const current = prev.reconciliation?.[reconcileKey] || { targetClosing: null, matchedTxIds: [], statementRows: [] };
            const rows = Array.isArray(current.statementRows) ? [...current.statementRows] : [];
            const matchedTxIds = new Set(current.matchedTxIds || []);
            const rowIdx = rows.findIndex((r) => r.id === rowId);
            if (rowIdx < 0) return prev;
            const previousMatch = rows[rowIdx].matchedTxId;
            if (previousMatch) matchedTxIds.delete(previousMatch);
            rows[rowIdx] = { ...rows[rowIdx], matchedTxId: txId };
            matchedTxIds.add(txId);
            return {
                ...prev,
                reconciliation: {
                    ...(prev.reconciliation || {}),
                    [reconcileKey]: {
                        ...current,
                        matchedTxIds: Array.from(matchedTxIds),
                        statementRows: rows
                    }
                }
            };
        }, 'manually link statement row');
        setStatementStatus('Statement row linked to ledger transaction.');
    };

    const clearStatementRowLink = (rowId) => {
        if (!rowId) return;
        commitState((prev) => {
            const current = prev.reconciliation?.[reconcileKey] || { targetClosing: null, matchedTxIds: [], statementRows: [] };
            const rows = Array.isArray(current.statementRows) ? [...current.statementRows] : [];
            const matchedTxIds = new Set(current.matchedTxIds || []);
            const rowIdx = rows.findIndex((r) => r.id === rowId);
            if (rowIdx < 0) return prev;
            if (rows[rowIdx].matchedTxId) matchedTxIds.delete(rows[rowIdx].matchedTxId);
            rows[rowIdx] = { ...rows[rowIdx], matchedTxId: null };
            return {
                ...prev,
                reconciliation: {
                    ...(prev.reconciliation || {}),
                    [reconcileKey]: {
                        ...current,
                        matchedTxIds: Array.from(matchedTxIds),
                        statementRows: rows
                    }
                }
            };
        }, 'unlink statement row');
        setStatementStatus('Statement row unlinked.');
    };

    const runGoalAutopilot = () => {
        let allocatedTotal = 0;
        let allocatedCount = 0;
        commitState((prev) => {
            if (isMonthLocked(prev, currentMonth)) return prev;
            const available = Math.max(0, computeLeftToAssignForMonth(prev, currentMonth));
            if (available <= 0) return prev;

            let remainingPool = available;
            const nextGoals = (prev.goals || []).map((g) => ({ ...g }));
            const ranked = nextGoals
                .filter((g) => g.autopilotEnabled !== false && Number(g.current || 0) < Number(g.target || 0))
                .sort((a, b) => String(a.targetDate || '').localeCompare(String(b.targetDate || '')));
            const allocations = [];

            ranked.forEach((goal) => {
                if (remainingPool <= 0) return;
                const remaining = Math.max(0, Number(goal.target || 0) - Number(goal.current || 0));
                if (remaining <= 0) return;
                const cap = Number(goal.autopilotMonthlyCap);
                const goalCap = Number.isFinite(cap) && cap > 0 ? cap : remaining;
                const allocate = Math.min(remaining, goalCap, remainingPool);
                if (allocate <= 0) return;
                goal.current = Number(goal.current || 0) + allocate;
                remainingPool -= allocate;
                allocations.push({ id: goal.id, name: goal.name, amount: allocate });
            });

            if (!allocations.length) return prev;
            allocatedTotal = allocations.reduce((sum, a) => sum + a.amount, 0);
            allocatedCount = allocations.length;
            const log = {
                id: uid('log'),
                timestamp: new Date().toISOString(),
                action: 'goal_autopilot',
                summary: `Allocated ${money(allocatedTotal)} across ${allocatedCount} goal(s).`,
                status: 'ok',
                allocations
            };
            return {
                ...prev,
                goals: nextGoals,
                executionLogs: [log, ...(prev.executionLogs || [])].slice(0, 80)
            };
        }, 'run goal autopilot');

        if (allocatedTotal > 0) {
            setOpsStatus(`Goal autopilot allocated ${money(allocatedTotal)} across ${allocatedCount} goal(s).`);
        } else {
            setOpsStatus('Goal autopilot skipped: no available surplus or eligible goals.');
        }
    };

    const runGuidedMonthClose = () => {
        if (!statementForm.accountId || !statementForm.month) return;
        const account = state.accounts.find((a) => a.id === statementForm.accountId);
        if (!account) return;
        if (isMonthLocked(state, statementForm.month)) {
            setOpsStatus(`Month ${statementForm.month} is already locked.`);
            return;
        }
        const current = state.reconciliation?.[reconcileKey] || { targetClosing: null, matchedTxIds: [], statementRows: [] };
        const statementRows = Array.isArray(current.statementRows) ? current.statementRows : [];
        const unmatchedRows = statementRows.filter((r) => !r.matchedTxId).length;
        if (statementRows.length > 0 && unmatchedRows > 0) {
            setOpsStatus(`Close blocked: ${unmatchedRows} statement row(s) still unmatched.`);
            return;
        }
        if (targetGap !== null && Math.abs(targetGap) > 0.01) {
            setOpsStatus(`Close blocked: target gap is ${money(targetGap)}.`);
            return;
        }
        if (Math.abs(unmatchedDelta) > 0.01) {
            setOpsStatus(`Close blocked: unmatched ledger delta is ${money(unmatchedDelta)}.`);
            return;
        }
        const snapshot = computeStatementMetrics(state, statementForm.accountId, statementForm.month);
        commitState((prev) => {
            const log = {
                id: uid('log'),
                timestamp: new Date().toISOString(),
                action: 'month_close_workflow',
                summary: `Closed ${statementForm.month} for ${account.name}. Tx: ${snapshot?.txCount || 0}, Net: ${money(snapshot?.monthDelta || 0)}.`,
                status: 'ok',
                accountId: statementForm.accountId,
                month: statementForm.month
            };
            return {
                ...prev,
                lockedMonths: { ...(prev.lockedMonths || {}), [statementForm.month]: true },
                executionLogs: [log, ...(prev.executionLogs || [])].slice(0, 80)
            };
        }, `guided close month ${statementForm.month}`);
        setOpsStatus(`Guided close complete. Month ${statementForm.month} is now locked.`);
    };

    const addGoal = (e) => {
        e.preventDefault();
        if (!goalForm.name.trim()) return;
        const target = Number(goalForm.target);
        const current = Number(goalForm.current);
        if (!Number.isFinite(target) || target <= 0) return;
        if (!Number.isFinite(current) || current < 0) return;
        commitState((prev) => ({
            ...prev,
            goals: [
                ...(prev.goals || []),
                {
                    id: uid('goal'),
                    name: goalForm.name.trim(),
                    target,
                    current,
                    targetDate: goalForm.targetDate,
                    autopilotEnabled: goalForm.autopilotEnabled !== false,
                    autopilotMonthlyCap: Number(goalForm.autopilotMonthlyCap) > 0 ? Number(goalForm.autopilotMonthlyCap) : null
                }
            ]
        }), 'add goal');
        setGoalForm({
            name: '',
            target: '',
            current: '',
            targetDate: addMonths(`${todayStr().slice(0, 7)}-01`, 24),
            autopilotEnabled: true,
            autopilotMonthlyCap: ''
        });
    };

    const updateGoalProgress = (goalId, value) => {
        const current = Number(value);
        if (!Number.isFinite(current) || current < 0) return;
        commitState((prev) => ({
            ...prev,
            goals: (prev.goals || []).map((g) => (g.id === goalId ? { ...g, current } : g))
        }), 'update goal progress');
    };

    const deleteGoal = (goalId) => {
        commitState((prev) => ({
            ...prev,
            goals: (prev.goals || []).filter((g) => g.id !== goalId)
        }), 'delete goal');
    };

    const updateGoalAutopilotSettings = (goalId, patch) => {
        commitState((prev) => ({
            ...prev,
            goals: (prev.goals || []).map((g) => (g.id === goalId ? { ...g, ...patch } : g))
        }), 'update goal autopilot settings');
    };

    const exportMonthCloseReport = () => {
        if (!statementMetrics) {
            setOpsStatus('No statement metrics available for export.');
            return;
        }
        const rows = [
            `metric,value`,
            `account,${statementMetrics.accountName}`,
            `month,${statementMetrics.month}`,
            `opening_balance,${statementMetrics.opening}`,
            `closing_balance,${statementMetrics.closing}`,
            `net_change,${statementMetrics.monthDelta}`,
            `cleared_delta,${statementMetrics.clearedDelta}`,
            `pending_delta,${statementMetrics.pendingDelta}`,
            `tx_count,${statementMetrics.txCount}`,
            `unmatched_delta,${unmatchedDelta}`,
            `target_gap,${targetGap === null ? '' : targetGap}`,
            `locked,${isMonthLocked(state, statementForm.month) ? 'true' : 'false'}`,
            '',
            'anomaly_category,current,avg_3mo,spike'
        ];
        spendAnomalies.forEach((a) => {
            rows.push(`${a.category},${a.current},${a.avg},${a.spike === Infinity ? 'new' : a.spike.toFixed(2)}`);
        });
        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fincalc-close-report-${statementForm.month}-${statementMetrics.accountName.replace(/\s+/g, '-').toLowerCase()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const postAdjustment = (e) => {
        e.preventDefault();
        const amount = Number(adjustmentForm.amount);
        if (!Number.isFinite(amount) || amount <= 0) return;
        const date = `${adjustmentForm.month}-${String(getDaysInMonth(adjustmentForm.month)).padStart(2, '0')}`;

        commitState((prev) => {
            const nextAccounts = prev.accounts.map((a) => {
                if (a.id !== adjustmentForm.accountId) return a;
                const delta = adjustmentForm.type === 'income' ? amount : -amount;
                return { ...a, balance: Number(a.balance || 0) + delta };
            });
            const tx = {
                id: uid('tx'),
                date,
                accountId: adjustmentForm.accountId,
                type: adjustmentForm.type,
                amount,
                category: 'Adjustment',
                note: adjustmentForm.note.trim() || `Month-end adjustment (${adjustmentForm.month})`,
                cleared: true
            };
            return {
                ...prev,
                accounts: nextAccounts,
                transactions: [tx, ...prev.transactions].slice(0, 1000)
            };
        }, 'post month-end adjustment');
        setOpsStatus(`Adjustment posted for ${adjustmentForm.month}.`);
        setAdjustmentForm((prev) => ({ ...prev, amount: '', note: '' }));
    };

    const runScheduledAutomation = () => {
        const today = todayStr();
        if (!state.autopilotSchedule?.enabled) {
            setOpsStatus('Scheduler is disabled.');
            return;
        }
        if (state.autopilotSchedule.nextRunDate > today) {
            setOpsStatus(`Scheduler next run is ${state.autopilotSchedule.nextRunDate}.`);
            return;
        }

        let recurringPosted = 0;
        let debtPosted = 0;
        let goalsFunded = 0;

        commitState((prev) => {
            let next = { ...prev };
            let nextAccounts = [...prev.accounts];
            let nextTransactions = [...prev.transactions];
            let nextRecurring = [...prev.recurring];
            const createdTxIds = [];

            if (prev.autopilotSchedule.runRecurring) {
                nextRecurring = nextRecurring.map((r) => {
                    let nextDate = r.nextDate;
                    while (nextDate <= today) {
                        if (!isMonthLocked(prev, monthPrefix(nextDate))) {
                            const duplicate = nextTransactions.some((t) => t.sourceRecurringId === r.id && t.date === nextDate);
                            if (!duplicate) {
                                const amount = Number(r.amount || 0);
                                const tx = {
                                    id: uid('tx'),
                                    date: nextDate,
                                    accountId: r.accountId,
                                    type: r.type,
                                    amount,
                                    category: r.category || 'General',
                                    note: `Scheduled recurring: ${r.name}`,
                                    sourceRecurringId: r.id,
                                    cleared: false
                                };
                                createdTxIds.push(tx.id);
                                nextTransactions = [tx, ...nextTransactions].slice(0, 1000);
                                const idx = nextAccounts.findIndex((a) => a.id === r.accountId);
                                if (idx >= 0) {
                                    const delta = r.type === 'income' ? amount : -amount;
                                    nextAccounts[idx] = { ...nextAccounts[idx], balance: Number(nextAccounts[idx].balance || 0) + delta };
                                }
                                recurringPosted += 1;
                            }
                        }
                        nextDate = nextRecurringDate(nextDate, r.frequency);
                    }
                    return { ...r, nextDate };
                });
            }

            if (prev.autopilotSchedule.runDebt && !isMonthLocked(prev, monthPrefix(today))) {
                const source = nextAccounts.find((a) => a.id === autopilotForm.fromAccountId);
                const liability = nextAccounts.find((a) => a.id === autopilotForm.liabilityAccountId);
                if (source && liability && Number(liability.balance || 0) < 0) {
                    const cap = Number(autopilotForm.amountCap);
                    const candidate = Number.isFinite(cap) && cap > 0 ? cap : Math.max(0, leftToAssign);
                    const payAmount = Math.min(candidate, Math.max(0, Number(source.balance || 0)), Math.abs(Number(liability.balance || 0)));
                    if (payAmount > 0) {
                        nextAccounts = nextAccounts.map((a) => {
                            if (a.id === source.id) return { ...a, balance: Number(a.balance || 0) - payAmount };
                            if (a.id === liability.id) return { ...a, balance: Number(a.balance || 0) + payAmount };
                            return a;
                        });
                        const outTx = {
                            id: uid('tx'),
                            date: today,
                            accountId: source.id,
                            type: 'expense',
                            amount: payAmount,
                            category: 'Debt Payment',
                            note: `Scheduled debt autopilot to ${liability.name}`,
                            cleared: false
                        };
                        const inTx = {
                            id: uid('tx'),
                            date: today,
                            accountId: liability.id,
                            type: 'income',
                            amount: payAmount,
                            category: 'Debt Payment',
                            note: `Scheduled debt autopilot from ${source.name}`,
                            cleared: false
                        };
                        createdTxIds.push(inTx.id, outTx.id);
                        nextTransactions = [inTx, outTx, ...nextTransactions].slice(0, 1000);
                        debtPosted += 1;
                    }
                }
            }

            if (prev.autopilotSchedule.runGoals && !isMonthLocked(prev, monthPrefix(today))) {
                const runMonth = monthPrefix(today);
                let remainingPool = Math.max(0, computeLeftToAssignForMonth(prev, runMonth));
                const nextGoals = (next.goals || []).map((g) => ({ ...g }));
                const ranked = nextGoals
                    .filter((g) => g.autopilotEnabled !== false && Number(g.current || 0) < Number(g.target || 0))
                    .sort((a, b) => String(a.targetDate || '').localeCompare(String(b.targetDate || '')));
                ranked.forEach((goal) => {
                    if (remainingPool <= 0) return;
                    const remaining = Math.max(0, Number(goal.target || 0) - Number(goal.current || 0));
                    if (remaining <= 0) return;
                    const cap = Number(goal.autopilotMonthlyCap);
                    const goalCap = Number.isFinite(cap) && cap > 0 ? cap : remaining;
                    const allocate = Math.min(remaining, goalCap, remainingPool);
                    if (allocate <= 0) return;
                    goal.current = Number(goal.current || 0) + allocate;
                    remainingPool -= allocate;
                    goalsFunded += 1;
                });
                next.goals = nextGoals;
            }

            const nextRunDate = addMonths(prev.autopilotSchedule.nextRunDate || today, 1);
            const log = {
                id: uid('log'),
                timestamp: new Date().toISOString(),
                action: 'scheduled_automation',
                summary: `Recurring posted: ${recurringPosted}, Debt posted: ${debtPosted}, Goals funded: ${goalsFunded}`,
                status: 'ok',
                createdTxIds
            };

            next = {
                ...next,
                accounts: nextAccounts,
                transactions: nextTransactions,
                recurring: nextRecurring,
                autopilotSchedule: {
                    ...prev.autopilotSchedule,
                    nextRunDate
                },
                executionLogs: [log, ...(prev.executionLogs || [])].slice(0, 80)
            };
            return next;
        }, 'run scheduled automation');

        setOpsStatus(`Scheduler run complete: recurring ${recurringPosted}, debt ${debtPosted}, goals ${goalsFunded}.`);
    };

    const exportTransactionsCsv = () => {
        const rows = [
            'date,type,amount,category,note,account,cleared',
            ...state.transactions.map((t) => {
                const account = state.accounts.find((a) => a.id === t.accountId)?.name || '';
                const safeNote = `"${String(t.note || '').replace(/"/g, '""')}"`;
                return [t.date, t.type, t.amount, t.category, safeNote, account, t.cleared ? 'true' : 'false'].join(',');
            })
        ];
        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fincalc-transactions-${todayStr()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const parseImportCsv = (text) => {
        const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
            return { rows: [], imported: 0, skipped: 0, error: 'CSV import failed: add header + rows.' };
        }

        const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
        const col = (name) => header.indexOf(name);
        const idxDate = col((csvMapping.date || '').toLowerCase());
        const idxType = col((csvMapping.type || '').toLowerCase());
        const idxAmount = col((csvMapping.amount || '').toLowerCase());
        const idxCategory = col((csvMapping.category || '').toLowerCase());
        const idxNote = col((csvMapping.note || '').toLowerCase());
        const idxAccount = col((csvMapping.account || '').toLowerCase());
        const idxCleared = col((csvMapping.cleared || '').toLowerCase());
        if (idxDate < 0 || idxType < 0 || idxAmount < 0) {
            return { rows: [], imported: 0, skipped: 0, error: 'CSV import failed: required columns date,type,amount.' };
        }

        let imported = 0;
        let skippedLocked = 0;
        const txToAdd = [];

        for (let i = 1; i < lines.length; i += 1) {
            const cells = parseCsvLine(lines[i]);
            const date = toDateString(cells[idxDate]);
            const type = String(cells[idxType] || '').toLowerCase() === 'income' ? 'income' : 'expense';
            const amount = Number(cells[idxAmount]);
            if (!date || !Number.isFinite(amount) || amount <= 0) continue;
            if (isMonthLocked(state, monthPrefix(date))) {
                skippedLocked += 1;
                continue;
            }

            const accountName = idxAccount >= 0 ? String(cells[idxAccount] || '').toLowerCase() : '';
            const account = state.accounts.find((a) => a.name.toLowerCase() === accountName) || state.accounts[0];
            if (!account) continue;

            txToAdd.push({
                id: uid('tx'),
                date,
                accountId: account.id,
                type,
                amount,
                category: idxCategory >= 0 ? (cells[idxCategory] || 'General') : 'General',
                note: idxNote >= 0 ? (cells[idxNote] || '') : '',
                cleared: idxCleared >= 0 ? String(cells[idxCleared] || '').toLowerCase() === 'true' : false
            });
            imported += 1;
        }

        return { rows: txToAdd, imported, skipped: skippedLocked, error: '' };
    };

    const previewCsvRows = () => {
        const parsed = parseImportCsv(csvText);
        if (parsed.error) {
            setCsvStatus(parsed.error);
            setCsvPreviewRows([]);
            setCsvPreviewSkipped(0);
            return;
        }
        setCsvPreviewRows(parsed.rows);
        setCsvPreviewSkipped(parsed.skipped);
        setCsvStatus(`Preview ready: ${parsed.imported} rows parsed, ${parsed.skipped} locked/skipped.`);
    };

    const importCsvRows = () => {
        const parsed = parseImportCsv(csvText);
        if (parsed.error) {
            setCsvStatus(parsed.error);
            return;
        }
        const txToAdd = parsed.rows;
        if (!txToAdd.length) {
            setCsvStatus('CSV import processed 0 rows.');
            return;
        }

        commitState((prev) => {
            const nextAccounts = [...prev.accounts];
            txToAdd.forEach((tx) => {
                const idx = nextAccounts.findIndex((a) => a.id === tx.accountId);
                if (idx >= 0) {
                    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
                    nextAccounts[idx] = { ...nextAccounts[idx], balance: Number(nextAccounts[idx].balance || 0) + delta };
                }
            });
            return {
                ...prev,
                accounts: nextAccounts,
                transactions: [...txToAdd, ...prev.transactions].slice(0, 1000)
            };
        }, `import csv (${parsed.imported})`);
        setCsvStatus(`CSV import complete: ${parsed.imported} rows, ${parsed.skipped} skipped (locked month).`);
        setCsvText('');
        setCsvPreviewRows([]);
        setCsvPreviewSkipped(0);
    };

    const monthCalendar = React.useMemo(() => {
        const daysCount = getDaysInMonth(viewMonth);
        const [year, month] = viewMonth.split('-').map(Number);
        const days = Array.from({ length: daysCount }, (_, idx) => {
            const dayNum = idx + 1;
            const date = `${viewMonth}-${String(dayNum).padStart(2, '0')}`;
            const dateObj = new Date(year, month - 1, dayNum);

            const tx = selectedMonthTx.filter((t) => t.date === date);
            const income = tx.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const expense = tx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const recurringImpact = state.recurring.reduce((sum, r) => {
                const next = new Date(r.nextDate);
                if (Number.isNaN(next.getTime())) return sum;
                let isDue = false;
                if (r.frequency === 'monthly') {
                    isDue = next.getDate() === dayNum && viewMonth >= monthPrefix(r.nextDate);
                } else if (r.frequency === 'yearly') {
                    isDue = next.getDate() === dayNum && (next.getMonth() + 1) === month && year >= next.getFullYear();
                } else if (r.frequency === 'weekly') {
                    isDue = next.getDay() === dateObj.getDay() && viewMonth >= monthPrefix(r.nextDate);
                }
                if (!isDue) return sum;
                return sum + (r.type === 'income' ? Number(r.amount || 0) : -Number(r.amount || 0));
            }, 0);

            const subscriptionImpact = state.subscriptions.reduce((sum, s) => {
                if (Number(s.billingDay) !== dayNum || s.active === false) return sum;
                return sum - Number(s.amount || 0);
            }, 0);

            return {
                date,
                dayNum,
                income,
                expense,
                recurringImpact,
                subscriptionImpact,
                net: income - expense + recurringImpact + subscriptionImpact
            };
        });
        return days;
    }, [viewMonth, selectedMonthTx, state.recurring, state.subscriptions]);

    const duplicateGroups = React.useMemo(() => {
        const groups = new Map();
        state.transactions.forEach((t) => {
            const key = `${t.date}|${t.accountId}|${t.type}|${Number(t.amount || 0)}|${String(t.category || '').toLowerCase()}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(t.id);
        });
        const dup = new Map();
        groups.forEach((arr, key) => {
            if (arr.length > 1) dup.set(key, arr);
        });
        return dup;
    }, [state.transactions]);
    const duplicateTxIds = React.useMemo(() => {
        const ids = new Set();
        duplicateGroups.forEach((arr) => arr.forEach((id) => ids.add(id)));
        return ids;
    }, [duplicateGroups]);

    const filteredTransactions = React.useMemo(() => {
        const query = txFilter.query.trim().toLowerCase();
        return state.transactions.filter((t) => {
            if (txFilter.accountId !== 'all' && t.accountId !== txFilter.accountId) return false;
            if (txFilter.type !== 'all' && t.type !== txFilter.type) return false;
            if (txFilter.cleared === 'cleared' && t.cleared !== true) return false;
            if (txFilter.cleared === 'pending' && t.cleared === true) return false;
            if (txFilter.category && !String(t.category || '').toLowerCase().includes(txFilter.category.toLowerCase())) return false;
            if (query) {
                const bucket = `${t.note || ''} ${t.category || ''}`.toLowerCase();
                if (!bucket.includes(query)) return false;
            }
            if (smartView === 'needs_review') {
                const ageDays = Math.floor((Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24));
                if (t.cleared === true || ageDays < 14) return false;
            }
            if (smartView === 'high_spend') {
                if (!(t.type === 'expense' && Number(t.amount || 0) >= 500)) return false;
            }
            if (smartView === 'duplicates') {
                if (!duplicateTxIds.has(t.id)) return false;
            }
            return true;
        });
    }, [state.transactions, txFilter, smartView, duplicateTxIds]);

    const txPageSize = 12;
    const txTotalPages = Math.max(1, Math.ceil(filteredTransactions.length / txPageSize));
    const safeTxPage = Math.min(txPage, txTotalPages);
    const txPageRows = filteredTransactions.slice((safeTxPage - 1) * txPageSize, safeTxPage * txPageSize);
    const allPageSelected = txPageRows.length > 0 && txPageRows.every((row) => selectedTxIds.includes(row.id));
    const currentMonthLocked = isMonthLocked(state, currentMonth);

    const statementMetrics = React.useMemo(
        () => computeStatementMetrics(state, statementForm.accountId, statementForm.month),
        [state, statementForm]
    );

    const reconcileKey = `${statementForm.accountId}:${statementForm.month}`;
    const reconcileData = state.reconciliation?.[reconcileKey] || { targetClosing: null, matchedTxIds: [], statementRows: [] };
    const statementTxRows = React.useMemo(() => {
        if (!statementForm.accountId || !statementForm.month) return [];
        return state.transactions
            .filter((t) => t.accountId === statementForm.accountId && monthPrefix(t.date) === statementForm.month)
            .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    }, [state.transactions, statementForm]);
    const matchedSet = new Set(reconcileData.matchedTxIds || []);
    const unmatchedDelta = statementTxRows
        .filter((t) => !matchedSet.has(t.id))
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount || 0) : -Number(t.amount || 0)), 0);
    const targetGap = statementMetrics && Number.isFinite(Number(reconcileData.targetClosing))
        ? Number(reconcileData.targetClosing) - Number(statementMetrics.closing || 0)
        : null;
    const suggestedMatchIds = React.useMemo(() => {
        return statementTxRows
            .filter((t) => !matchedSet.has(t.id))
            .filter((t) => t.cleared === true || duplicateTxIds.has(t.id))
            .map((t) => t.id);
    }, [statementTxRows, duplicateTxIds, reconcileData.matchedTxIds]);
    const statementRows = Array.isArray(reconcileData.statementRows) ? reconcileData.statementRows : [];
    const statementCoverage = statementRows.length > 0
        ? Math.round((statementRows.filter((r) => r.matchedTxId).length / statementRows.length) * 100)
        : null;
    const selectedLog = (state.executionLogs || []).find((l) => l.id === selectedLogId) || null;
    const spendAnomalies = React.useMemo(() => {
        const months = [currentMonth, addMonths(`${currentMonth}-01`, -1).slice(0, 7), addMonths(`${currentMonth}-01`, -2).slice(0, 7), addMonths(`${currentMonth}-01`, -3).slice(0, 7)];
        const monthCategorySpend = {};
        state.transactions.forEach((t) => {
            if (t.type !== 'expense') return;
            const mm = monthPrefix(t.date);
            if (!months.includes(mm)) return;
            if (!monthCategorySpend[mm]) monthCategorySpend[mm] = {};
            const cat = t.category || 'General';
            monthCategorySpend[mm][cat] = (monthCategorySpend[mm][cat] || 0) + Number(t.amount || 0);
        });
        const current = monthCategorySpend[currentMonth] || {};
        const prevMonths = months.slice(1);
        const anomalies = Object.entries(current).map(([cat, value]) => {
            const prevVals = prevMonths.map((m) => (monthCategorySpend[m]?.[cat] || 0));
            const avg = prevVals.reduce((a, b) => a + b, 0) / prevVals.length;
            const spike = avg > 0 ? value / avg : (value > 0 ? Infinity : 1);
            return { category: cat, current: value, avg, spike };
        }).filter((x) => x.current >= 100 && (x.avg === 0 || x.spike >= 1.5))
            .sort((a, b) => b.spike - a.spike)
            .slice(0, 8);
        return anomalies;
    }, [state.transactions, currentMonth]);
    const goalInsights = React.useMemo(() => {
        return (state.goals || []).map((g) => {
            const target = Number(g.target || 0);
            const current = Number(g.current || 0);
            const remaining = Math.max(0, target - current);
            const progress = target > 0 ? Math.min(1, current / target) : 0;
            const now = new Date();
            const targetDate = new Date(g.targetDate);
            const monthsLeft = Math.max(1, Math.ceil((targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth())));
            const monthlyRequired = remaining / monthsLeft;
            return { ...g, remaining, progress, monthsLeft, monthlyRequired };
        });
    }, [state.goals]);
    const currentSectionMeta = MONEY_OS_SECTIONS.find((section) => section.id === activeSection) || MONEY_OS_SECTIONS[0];
    const onboardingChecklist = React.useMemo(() => [
        { id: 'accounts', label: 'Connect your financial picture', detail: 'Add at least one account.', done: state.accounts.length > 0 },
        { id: 'transactions', label: 'Load real activity', detail: 'Add or import transactions.', done: state.transactions.length > 0 },
        { id: 'budgets', label: 'Set spending guardrails', detail: 'Create at least one budget category.', done: state.budgets.length > 0 },
        { id: 'recurring', label: 'Automate fixed cashflow', detail: 'Track recurring bills or income.', done: state.recurring.length > 0 || state.subscriptions.length > 0 },
        { id: 'goals', label: 'Define what the surplus is for', detail: 'Add at least one goal bucket.', done: state.goals.length > 0 }
    ], [state.accounts.length, state.transactions.length, state.budgets.length, state.recurring.length, state.subscriptions.length, state.goals.length]);
    const completedChecklistCount = onboardingChecklist.filter((item) => item.done).length;
    const overspentBudgets = budgetUtilization.filter((item) => item.ratio > 1);
    const attentionItems = React.useMemo(() => {
        const items = [];
        if (leftToAssign < 0) {
            items.push({ id: 'over-assigned', title: 'You have assigned more than this month supports.', detail: `Left to assign is ${money(leftToAssign)}. Tighten budgets or add missing income.`, section: 'setup' });
        }
        if (overspentBudgets.length > 0) {
            items.push({ id: 'over-budget', title: 'Some categories are over budget.', detail: `${overspentBudgets.slice(0, 2).map((item) => item.category).join(', ')} need review.`, section: 'setup' });
        }
        if (pendingCount >= 8) {
            items.push({ id: 'pending', title: 'Too many transactions are still pending.', detail: `${pendingCount} transactions are not cleared yet.`, section: 'transactions' });
        }
        if (state.goals.length === 0) {
            items.push({ id: 'no-goals', title: 'Your surplus has no destination yet.', detail: 'Create a goal so excess cash has a job.', section: 'planning' });
        }
        if (totalDebt > 0 && state.autopilotSchedule?.enabled !== true) {
            items.push({ id: 'debt-scheduler', title: 'Debt exists but scheduler is off.', detail: 'Turn on automation if you want debt or goals to move without manual runs.', section: 'automation' });
        }
        return items.slice(0, 4);
    }, [leftToAssign, overspentBudgets, pendingCount, state.goals.length, totalDebt, state.autopilotSchedule?.enabled]);
    const recommendedAction = React.useMemo(() => {
        if (state.transactions.length === 0) {
            return { title: 'Add your first real transactions', detail: 'Without actual income and expenses, budgets and goals will stay theoretical.', section: 'transactions', cta: 'Open transactions' };
        }
        if (overspentBudgets.length > 0) {
            return { title: 'Repair budget drift', detail: `${overspentBudgets.length} budget categories are over target this month.`, section: 'setup', cta: 'Review budgets' };
        }
        if (state.goals.length === 0) {
            return { title: 'Give the surplus a destination', detail: 'Set a goal bucket so extra cash starts moving toward something concrete.', section: 'planning', cta: 'Create a goal' };
        }
        if (state.autopilotSchedule?.enabled !== true) {
            return { title: 'Automate the routine work', detail: 'Recurring entries and goal funding still depend on manual runs.', section: 'automation', cta: 'Set up automation' };
        }
        return { title: 'Your operating system is in decent shape', detail: 'Use transactions for daily review or planning to check goal progress.', section: 'planning', cta: 'Review goals' };
    }, [state.transactions.length, overspentBudgets.length, state.goals.length, state.autopilotSchedule?.enabled]);


    const NAV_ITEMS = [
        { id: 'overview', label: 'Overview', icon: '◈' },
        { id: 'setup', label: 'Accounts', icon: '⬡' },
        { id: 'transactions', label: 'Transactions', icon: '↕' },
        { id: 'planning', label: 'Planning', icon: '◎' },
        { id: 'automation', label: 'Automation', icon: '⚙' },
    ];

    if (!ready) return (
        <div style={{minHeight:'400px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{color:'#64748b',fontSize:'14px',fontWeight:600}}>Loading Money OS…</div>
        </div>
    );

    const accentColor = (v) => Number(v) >= 0 ? '#10b981' : '#f43f5e';

    return (
        <section id="money-os" style={{padding:'32px 0'}}>
            <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px'}}>

                {/* Header */}
                <div style={{marginBottom:'28px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
                        <div>
                            <p style={{fontSize:'11px',fontWeight:800,letterSpacing:'0.2em',textTransform:'uppercase',color:'#6366f1',marginBottom:'6px'}}>Money OS</p>
                            <h2 style={{fontSize:'28px',fontWeight:900,color:'#0f172a',margin:0}}>Personal Finance Command Center</h2>
                            <p style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>Local-first · All data stays in your browser</p>
                        </div>
                        <div style={{display:'flex',gap:'8px'}}>
                            <MosBtn onClick={undoLast} disabled={!undoStack.length} variant="ghost">↩ Undo</MosBtn>
                            <MosBtn onClick={redoLast} disabled={!redoStack.length} variant="ghost">↪ Redo</MosBtn>
                            <MosBtn onClick={exportTransactionsCsv} variant="ghost">⬇ Export</MosBtn>
                        </div>
                    </div>
                    {opsStatus && <div style={{marginTop:'10px',padding:'8px 14px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'8px',fontSize:'12px',color:'#059669',fontWeight:600}}>{opsStatus}</div>}
                </div>

                {/* KPI Strip */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'12px',marginBottom:'24px'}}>
                    {[
                        {label:'Net Worth',value:money(netWorth),color:accentColor(netWorth)},
                        {label:'Income (MTD)',value:money(totalIncome),color:'#10b981'},
                        {label:'Spent (MTD)',value:money(totalExpense),color:'#f43f5e'},
                        {label:'Left to Assign',value:money(leftToAssign),color:accentColor(leftToAssign)},
                        {label:'Subscriptions',value:money(monthlySubscriptionCost),color:'#8b5cf6'},
                        {label:'Debt',value:money(totalDebt),color:totalDebt>0?'#f43f5e':'#10b981'},
                        {label:'Cleared',value:String(clearedCount),color:'#10b981'},
                        {label:'Pending',value:String(pendingCount),color:'#f59e0b'},
                    ].map(k=>(
                        <div key={k.label} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'14px',padding:'16px',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                            <div style={{fontSize:'10px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'6px'}}>{k.label}</div>
                            <div style={{fontSize:'20px',fontWeight:900,color:k.color}}>{k.value}</div>
                        </div>
                    ))}
                </div>

                {/* Nav Tabs */}
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'24px',background:'#f8fafc',padding:'6px',borderRadius:'14px',border:'1px solid #e2e8f0'}}>
                    {NAV_ITEMS.map(n=>(
                        <button key={n.id} type="button" onClick={()=>setActiveSection(n.id)}
                            style={{padding:'8px 18px',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:700,transition:'all 0.15s',
                                background:activeSection===n.id?'#6366f1':'transparent',
                                color:activeSection===n.id?'#fff':'#64748b',
                                boxShadow:activeSection===n.id?'0 2px 8px rgba(99,102,241,0.3)':'none'
                            }}>
                            {n.icon} {n.label}
                        </button>
                    ))}
                </div>

                {/* OVERVIEW */}
                {activeSection==='overview' && (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'20px'}}>
                        <MosCard title="Recommended Next Step">
                            <div style={{padding:'14px',background:'linear-gradient(135deg,#eef2ff,#f8fafc)',border:'1px solid #c7d2fe',borderRadius:'14px'}}>
                                <div style={{fontSize:'18px',fontWeight:900,color:'#312e81',marginBottom:'6px'}}>{recommendedAction.title}</div>
                                <div style={{fontSize:'13px',lineHeight:1.55,color:'#475569'}}>{recommendedAction.detail}</div>
                                <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'14px'}}>
                                    <MosBtn onClick={()=>setActiveSection(recommendedAction.section)} variant="primary">{recommendedAction.cta}</MosBtn>
                                    <MosBtn onClick={runScheduledAutomation} variant="ghost">Run automation now</MosBtn>
                                </div>
                            </div>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'10px',marginTop:'14px'}}>
                                <div style={{padding:'12px',borderRadius:'12px',background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                                    <div style={{fontSize:'11px',fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase',color:'#94a3b8'}}>Checklist</div>
                                    <div style={{fontSize:'22px',fontWeight:900,color:'#0f172a',marginTop:'4px'}}>{completedChecklistCount}/5</div>
                                </div>
                                <div style={{padding:'12px',borderRadius:'12px',background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                                    <div style={{fontSize:'11px',fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase',color:'#94a3b8'}}>Attention items</div>
                                    <div style={{fontSize:'22px',fontWeight:900,color:attentionItems.length>0?'#f43f5e':'#10b981',marginTop:'4px'}}>{attentionItems.length}</div>
                                </div>
                            </div>
                        </MosCard>

                        <MosCard title="Setup Checklist">
                            <div style={{height:'8px',background:'#e2e8f0',borderRadius:'999px',overflow:'hidden',marginBottom:'16px'}}>
                                <div style={{height:'100%',width:`${(completedChecklistCount/onboardingChecklist.length)*100}%`,background:'linear-gradient(90deg,#6366f1,#0ea5e9)',borderRadius:'999px',transition:'width 0.3s'}} />
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                                {onboardingChecklist.map((item)=>(
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={()=>setActiveSection(item.id==='goals' ? 'planning' : item.id==='transactions' ? 'transactions' : 'setup')}
                                        style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',textAlign:'left',padding:'12px 14px',background:item.done?'#f0fdf4':'#fff',border:`1px solid ${item.done?'#bbf7d0':'#e2e8f0'}`,borderRadius:'12px',cursor:'pointer'}}
                                    >
                                        <div>
                                            <div style={{fontSize:'13px',fontWeight:800,color:'#0f172a'}}>{item.label}</div>
                                            <div style={{fontSize:'11px',color:'#64748b',marginTop:'4px'}}>{item.detail}</div>
                                        </div>
                                        <span style={{fontSize:'11px',fontWeight:800,color:item.done?'#059669':'#f59e0b',whiteSpace:'nowrap'}}>
                                            {item.done ? 'Done' : 'Needs work'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </MosCard>

                        <MosCard title="Needs Attention">
                            {attentionItems.length===0 && <EmptyMsg>No immediate issues. This is the state users expect.</EmptyMsg>}
                            {attentionItems.map(item=>(
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={()=>setActiveSection(item.section)}
                                    style={{display:'block',width:'100%',textAlign:'left',padding:'12px 14px',borderRadius:'12px',border:'1px solid #fecaca',background:'#fff1f2',marginBottom:'10px',cursor:'pointer'}}
                                >
                                    <div style={{fontSize:'13px',fontWeight:800,color:'#9f1239'}}>{item.title}</div>
                                    <div style={{fontSize:'11px',lineHeight:1.5,color:'#64748b',marginTop:'4px'}}>{item.detail}</div>
                                </button>
                            ))}
                            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'8px'}}>
                                <MosBtn onClick={()=>setActiveSection('setup')} variant="secondary">Review setup</MosBtn>
                                <MosBtn onClick={()=>setActiveSection('transactions')} variant="ghost">Open transactions</MosBtn>
                            </div>
                        </MosCard>

                        <MosCard title="Cashflow and Progress">
                            <div style={{display:'grid',gap:'12px'}}>
                                <div style={{padding:'12px 14px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'12px'}}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                        <span style={{fontSize:'13px',fontWeight:800,color:'#0f172a'}}>Budget posture</span>
                                        <span style={{fontSize:'12px',fontWeight:800,color:overspentBudgets.length>0?'#f43f5e':'#10b981'}}>
                                            {overspentBudgets.length>0 ? `${overspentBudgets.length} over target` : 'On track'}
                                        </span>
                                    </div>
                                    <div style={{fontSize:'11px',color:'#64748b',marginTop:'6px'}}>
                                        {budgetUtilization.length===0 ? 'No budgets set yet.' : `Tracking ${budgetUtilization.length} categories this month.`}
                                    </div>
                                </div>
                                <div style={{padding:'12px 14px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'12px'}}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                        <span style={{fontSize:'13px',fontWeight:800,color:'#0f172a'}}>Goals</span>
                                        <span style={{fontSize:'12px',fontWeight:800,color:'#6366f1'}}>{state.goals.length} active</span>
                                    </div>
                                    <div style={{fontSize:'11px',color:'#64748b',marginTop:'6px'}}>
                                        {state.goals.length===0 ? 'No destination for surplus yet.' : `${goalInsights.filter(g=>g.progress>=1).length} completed, ${goalInsights.filter(g=>g.progress<1).length} still in progress.`}
                                    </div>
                                </div>
                                <div style={{padding:'12px 14px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'12px'}}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                        <span style={{fontSize:'13px',fontWeight:800,color:'#0f172a'}}>Recurring cashflow</span>
                                        <span style={{fontSize:'12px',fontWeight:800,color:'#8b5cf6'}}>{upcomingRecurring.length} queued</span>
                                    </div>
                                    <div style={{fontSize:'11px',color:'#64748b',marginTop:'6px'}}>
                                        {upcomingRecurring.length===0 ? 'Recurring bills and income are not set yet.' : `Next item: ${upcomingRecurring[0].name} on ${upcomingRecurring[0].nextDate}.`}
                                    </div>
                                </div>
                            </div>
                        </MosCard>
                    </div>
                )}

                {/* SETUP - ACCOUNTS */}
                {activeSection==='setup' && (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'20px'}}>
                        <MosCard title="🏦 Accounts">
                            <form onSubmit={addAccount} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'16px'}}>
                                <MosInput value={accountForm.name} onChange={e=>setAccountForm({...accountForm,name:e.target.value})} placeholder="Account name" style={{gridColumn:'1/-1'}}/>
                                <MosSelect value={accountForm.type} onChange={e=>setAccountForm({...accountForm,type:e.target.value})}>
                                    <option value="cash">Cash</option><option value="investment">Investment</option><option value="liability">Liability</option>
                                </MosSelect>
                                <MosInput type="number" value={accountForm.balance} onChange={e=>setAccountForm({...accountForm,balance:e.target.value})} placeholder="Opening balance"/>
                                <MosBtn type="submit" variant="primary" style={{gridColumn:'1/-1'}}>+ Add Account</MosBtn>
                            </form>
                            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                                {state.accounts.map(a=>(
                                    <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px'}}>
                                        <div>
                                            <div style={{fontWeight:700,fontSize:'13px'}}>{a.name}</div>
                                            <div style={{fontSize:'11px',color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em'}}>{a.type}</div>
                                        </div>
                                        <div style={{fontWeight:800,fontSize:'16px',color:Number(a.balance)>=0?'#0f172a':'#f43f5e'}}>{money(a.balance)}</div>
                                    </div>
                                ))}
                            </div>
                        </MosCard>
                        <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                            <MosCard title="↔ Transfer">
                                <form onSubmit={addTransfer} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                                    <MosInput type="date" value={transferForm.date} onChange={e=>setTransferForm({...transferForm,date:e.target.value})} style={{gridColumn:'1/-1'}}/>
                                    <MosSelect value={transferForm.fromAccountId} onChange={e=>setTransferForm({...transferForm,fromAccountId:e.target.value})}>
                                        {state.accounts.map(a=><option key={a.id} value={a.id}>From: {a.name}</option>)}
                                    </MosSelect>
                                    <MosSelect value={transferForm.toAccountId} onChange={e=>setTransferForm({...transferForm,toAccountId:e.target.value})}>
                                        {state.accounts.map(a=><option key={a.id} value={a.id}>To: {a.name}</option>)}
                                    </MosSelect>
                                    <MosInput type="number" min="0" value={transferForm.amount} onChange={e=>setTransferForm({...transferForm,amount:e.target.value})} placeholder="Amount"/>
                                    <MosInput value={transferForm.note} onChange={e=>setTransferForm({...transferForm,note:e.target.value})} placeholder="Note"/>
                                    <MosBtn type="submit" variant="primary" style={{gridColumn:'1/-1'}}>Post Transfer</MosBtn>
                                </form>
                            </MosCard>
                            <MosCard title="📋 Budgets">
                                <form onSubmit={addBudget} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                                    <MosInput value={budgetForm.category} onChange={e=>setBudgetForm({...budgetForm,category:e.target.value})} placeholder="Category"/>
                                    <MosInput type="number" value={budgetForm.limit} onChange={e=>setBudgetForm({...budgetForm,limit:e.target.value})} placeholder="Monthly limit"/>
                                    <MosBtn type="submit" variant="primary" style={{gridColumn:'1/-1'}}>+ Add Budget</MosBtn>
                                </form>
                                {state.budgets.map(b=>(
                                    <div key={b.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:'13px'}}>
                                        <span style={{fontWeight:600}}>{b.category}</span><span style={{color:'#6366f1',fontWeight:700}}>{money(b.limit)}/mo</span>
                                    </div>
                                ))}
                            </MosCard>
                            <MosCard title="🔁 Recurring">
                                <form onSubmit={addRecurring} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                                    <MosInput value={recurringForm.name} onChange={e=>setRecurringForm({...recurringForm,name:e.target.value})} placeholder="Name" style={{gridColumn:'1/-1'}}/>
                                    <MosInput type="number" value={recurringForm.amount} onChange={e=>setRecurringForm({...recurringForm,amount:e.target.value})} placeholder="Amount"/>
                                    <MosSelect value={recurringForm.type} onChange={e=>setRecurringForm({...recurringForm,type:e.target.value})}>
                                        <option value="expense">Expense</option><option value="income">Income</option>
                                    </MosSelect>
                                    <MosSelect value={recurringForm.frequency} onChange={e=>setRecurringForm({...recurringForm,frequency:e.target.value})}>
                                        <option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="yearly">Yearly</option>
                                    </MosSelect>
                                    <MosInput type="date" value={recurringForm.nextDate} onChange={e=>setRecurringForm({...recurringForm,nextDate:e.target.value})}/>
                                    <MosSelect value={recurringForm.accountId} onChange={e=>setRecurringForm({...recurringForm,accountId:e.target.value})} style={{gridColumn:'1/-1'}}>
                                        {state.accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                                    </MosSelect>
                                    <MosBtn type="submit" variant="primary" style={{gridColumn:'1/-1'}}>{recurringEditId?'Update':'+ Add'} Recurring</MosBtn>
                                </form>
                                {state.recurring.map(r=>(
                                    <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:'13px'}}>
                                        <div><div style={{fontWeight:600}}>{r.name}</div><div style={{fontSize:'11px',color:'#94a3b8'}}>{r.nextDate} · {r.frequency}</div></div>
                                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                            <span style={{fontWeight:700,color:r.type==='income'?'#10b981':'#f43f5e'}}>{money(r.amount)}</span>
                                            <MosBtn onClick={()=>editRecurring(r.id)} variant="ghost" small>Edit</MosBtn>
                                            <MosBtn onClick={()=>deleteRecurring(r.id)} variant="danger" small>✕</MosBtn>
                                        </div>
                                    </div>
                                ))}
                            </MosCard>
                            <MosCard title="📲 Subscriptions">
                                <form onSubmit={addSubscription} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                                    <MosInput value={subForm.name} onChange={e=>setSubForm({...subForm,name:e.target.value})} placeholder="Service name"/>
                                    <MosInput type="number" value={subForm.amount} onChange={e=>setSubForm({...subForm,amount:e.target.value})} placeholder="Amount/mo"/>
                                    <MosBtn type="submit" variant="primary" style={{gridColumn:'1/-1'}}>+ Add Subscription</MosBtn>
                                </form>
                                {state.subscriptions.map(s=>(
                                    <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:'13px'}}>
                                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:s.active===false?'#94a3b8':'#10b981'}}/>
                                            <span style={{fontWeight:600}}>{s.name}</span>
                                        </div>
                                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                            <span style={{fontWeight:700,color:'#8b5cf6'}}>{money(s.amount)}</span>
                                            <MosBtn onClick={()=>toggleSubscriptionActive(s.id)} variant="ghost" small>{s.active===false?'Enable':'Pause'}</MosBtn>
                                            <MosBtn onClick={()=>deleteSubscription(s.id)} variant="danger" small>✕</MosBtn>
                                        </div>
                                    </div>
                                ))}
                            </MosCard>
                            <MosCard title="⚡ Auto-Rules">
                                <form onSubmit={addRule} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                                    <MosInput value={ruleForm.contains} onChange={e=>setRuleForm({...ruleForm,contains:e.target.value})} placeholder="Keyword (e.g. uber)" style={{gridColumn:'1/-1'}}/>
                                    <MosInput value={ruleForm.category} onChange={e=>setRuleForm({...ruleForm,category:e.target.value})} placeholder="Assign category"/>
                                    <MosSelect value={ruleForm.type} onChange={e=>setRuleForm({...ruleForm,type:e.target.value})}>
                                        <option value="expense">Expense</option><option value="income">Income</option>
                                    </MosSelect>
                                    <MosBtn type="submit" variant="primary" style={{gridColumn:'1/-1'}}>+ Add Rule</MosBtn>
                                </form>
                                {state.rules.map(r=>(
                                    <div key={r.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f1f5f9',fontSize:'12px'}}>
                                        <span><span style={{fontWeight:700,color:'#6366f1'}}>"{r.contains}"</span> → {r.category}</span>
                                        <span style={{color:'#94a3b8'}}>{r.type}</span>
                                    </div>
                                ))}
                            </MosCard>
                        </div>
                    </div>
                )}

                {/* TRANSACTIONS */}
                {activeSection==='transactions' && (
                    <div style={{display:'grid',gridTemplateColumns:'360px 1fr',gap:'20px'}}>
                        <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                            <MosCard title="+ Add Transaction">
                                <form onSubmit={addTransaction} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                                    <MosInput type="date" value={txForm.date} onChange={e=>setTxForm({...txForm,date:e.target.value})} style={{gridColumn:'1/-1'}}/>
                                    <MosSelect value={txForm.accountId} onChange={e=>setTxForm({...txForm,accountId:e.target.value})} style={{gridColumn:'1/-1'}}>
                                        {state.accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                                    </MosSelect>
                                    <MosSelect value={txForm.type} onChange={e=>setTxForm({...txForm,type:e.target.value})}>
                                        <option value="expense">Expense</option><option value="income">Income</option>
                                    </MosSelect>
                                    <MosInput type="number" min="0" value={txForm.amount} onChange={e=>setTxForm({...txForm,amount:e.target.value})} placeholder="Amount"/>
                                    <MosInput value={txForm.category} onChange={e=>setTxForm({...txForm,category:e.target.value})} placeholder="Category"/>
                                    <MosInput value={txForm.note} onChange={e=>setTxForm({...txForm,note:e.target.value})} placeholder="Note"/>
                                    <MosBtn type="submit" variant="primary" style={{gridColumn:'1/-1'}}>Add Transaction</MosBtn>
                                </form>
                            </MosCard>
                            <MosCard title="📥 Import CSV">
                                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'8px'}}>
                                    {Object.entries(CSV_PRESETS).map(([k,v])=>(
                                        <MosBtn key={k} onClick={()=>setCsvMapping(v)} variant="ghost" small>{k.replace('_like','')}</MosBtn>
                                    ))}
                                </div>
                                <textarea value={csvText} onChange={e=>setCsvText(e.target.value)} placeholder="Paste CSV with header: date,type,amount,category,note,account,cleared"
                                    style={{width:'100%',boxSizing:'border-box',minHeight:'80px',borderRadius:'8px',border:'1px solid #e2e8f0',padding:'8px',fontSize:'11px',fontFamily:'monospace',resize:'vertical'}}/>
                                <div style={{display:'flex',gap:'8px',marginTop:'8px',flexWrap:'wrap'}}>
                                    <MosBtn onClick={previewCsvRows} variant="secondary">Preview</MosBtn>
                                    <MosBtn onClick={importCsvRows} variant="primary">Commit Import</MosBtn>
                                </div>
                                {csvStatus&&<div style={{marginTop:'8px',fontSize:'12px',color:'#6366f1',fontWeight:600}}>{csvStatus}</div>}
                            </MosCard>
                        </div>
                        <MosCard title="📒 Ledger">
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                                <MosInput value={txFilter.query} onChange={e=>setTxFilter({...txFilter,query:e.target.value})} placeholder="Search note / category" style={{gridColumn:'1/-1'}}/>
                                <MosSelect value={txFilter.accountId} onChange={e=>setTxFilter({...txFilter,accountId:e.target.value})}>
                                    <option value="all">All accounts</option>
                                    {state.accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                                </MosSelect>
                                <MosSelect value={txFilter.type} onChange={e=>setTxFilter({...txFilter,type:e.target.value})}>
                                    <option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option>
                                </MosSelect>
                                <MosSelect value={txFilter.cleared} onChange={e=>setTxFilter({...txFilter,cleared:e.target.value})}>
                                    <option value="all">All statuses</option><option value="cleared">Cleared</option><option value="pending">Pending</option>
                                </MosSelect>
                            </div>
                            <div style={{display:'flex',gap:'6px',marginBottom:'10px',flexWrap:'wrap'}}>
                                {['all','needs_review','high_spend','duplicates'].map(v=>(
                                    <button key={v} type="button" onClick={()=>setSmartView(v)}
                                        style={{padding:'4px 12px',borderRadius:'99px',border:'1px solid',fontSize:'11px',fontWeight:700,cursor:'pointer',
                                            borderColor:smartView===v?'#6366f1':'#e2e8f0',
                                            background:smartView===v?'#eef2ff':'transparent',
                                            color:smartView===v?'#6366f1':'#64748b'}}>
                                        {v==='all'?'All':v==='needs_review'?'Needs Review':v==='high_spend'?'High Spend':'Duplicates'}
                                    </button>
                                ))}
                            </div>
                            <div style={{display:'flex',gap:'6px',alignItems:'center',marginBottom:'10px',flexWrap:'wrap'}}>
                                <MosBtn onClick={toggleSelectPage} variant="ghost" small>{allPageSelected?'Deselect':'Select'} page</MosBtn>
                                <MosBtn onClick={()=>bulkSetCleared(true)} variant="ghost" small>✓ Bulk clear</MosBtn>
                                <MosBtn onClick={()=>bulkSetCleared(false)} variant="ghost" small>◌ Bulk pending</MosBtn>
                                <MosBtn onClick={bulkDeleteSelected} variant="danger" small>✕ Delete ({selectedTxIds.length})</MosBtn>
                                <span style={{fontSize:'11px',color:'#94a3b8',marginLeft:'auto'}}>{filteredTransactions.length} transactions</span>
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:'6px',maxHeight:'400px',overflowY:'auto'}}>
                                {txPageRows.length===0&&<EmptyMsg>No transactions match your filters.</EmptyMsg>}
                                {txPageRows.map(t=>{
                                    const acct=state.accounts.find(a=>a.id===t.accountId);
                                    return(
                                        <div key={t.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:'#f8fafc',border:`1px solid ${t.cleared?'#d1fae5':'#fef3c7'}`,borderRadius:'10px',fontSize:'13px'}}>
                                            <input type="checkbox" checked={selectedTxIds.includes(t.id)} onChange={()=>toggleSelectTx(t.id)} style={{cursor:'pointer'}}/>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                                                    <span style={{fontWeight:700,color:'#0f172a'}}>{t.category}</span>
                                                    {acct&&<span style={{fontSize:'10px',padding:'2px 6px',borderRadius:'4px',background:'#e0e7ff',color:'#4f46e5',fontWeight:600}}>{acct.name}</span>}
                                                </div>
                                                <div style={{fontSize:'11px',color:'#94a3b8',marginTop:'2px'}}>{t.date} · {t.note||'No note'}</div>
                                            </div>
                                            <div style={{fontWeight:800,fontSize:'14px',color:t.type==='income'?'#10b981':'#f43f5e',whiteSpace:'nowrap'}}>{t.type==='income'?'+':'-'}{money(t.amount)}</div>
                                            <button type="button" onClick={()=>toggleTransactionCleared(t.id)} style={{padding:'3px 8px',borderRadius:'6px',border:'1px solid',fontSize:'10px',fontWeight:700,cursor:'pointer',
                                                borderColor:t.cleared?'#10b981':'#f59e0b',color:t.cleared?'#10b981':'#f59e0b',background:'transparent'}}>
                                                {t.cleared?'CLR':'PND'}
                                            </button>
                                            <button type="button" onClick={()=>deleteTransaction(t.id)} style={{padding:'3px 8px',borderRadius:'6px',border:'1px solid #fca5a5',color:'#f43f5e',background:'transparent',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>✕</button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'12px'}}>
                                <MosBtn onClick={()=>setTxPage(p=>Math.max(1,p-1))} disabled={safeTxPage<=1} variant="ghost">← Prev</MosBtn>
                                <span style={{fontSize:'12px',color:'#64748b',fontWeight:600}}>Page {safeTxPage} / {txTotalPages}</span>
                                <MosBtn onClick={()=>setTxPage(p=>Math.min(txTotalPages,p+1))} disabled={safeTxPage>=txTotalPages} variant="ghost">Next →</MosBtn>
                            </div>
                        </MosCard>
                    </div>
                )}

                {/* PLANNING */}
                {activeSection==='planning' && (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:'20px'}}>
                        <MosCard title="🎯 Goals">
                            <form onSubmit={addGoal} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'16px'}}>
                                <MosInput value={goalForm.name} onChange={e=>setGoalForm({...goalForm,name:e.target.value})} placeholder="Goal name" style={{gridColumn:'1/-1'}}/>
                                <MosInput type="number" value={goalForm.target} onChange={e=>setGoalForm({...goalForm,target:e.target.value})} placeholder="Target amount"/>
                                <MosInput type="number" value={goalForm.current} onChange={e=>setGoalForm({...goalForm,current:e.target.value})} placeholder="Current saved"/>
                                <MosInput type="date" value={goalForm.targetDate} onChange={e=>setGoalForm({...goalForm,targetDate:e.target.value})} style={{gridColumn:'1/-1'}}/>
                                <MosBtn type="submit" variant="primary" style={{gridColumn:'1/-1'}}>+ Add Goal</MosBtn>
                            </form>
                            {goalInsights.map(g=>(
                                <div key={g.id} style={{padding:'12px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px',marginBottom:'10px'}}>
                                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                                        <span style={{fontWeight:700,fontSize:'13px'}}>{g.name}</span>
                                        <MosBtn onClick={()=>deleteGoal(g.id)} variant="danger" small>✕</MosBtn>
                                    </div>
                                    <div style={{height:'6px',background:'#e2e8f0',borderRadius:'99px',overflow:'hidden',marginBottom:'6px'}}>
                                        <div style={{height:'100%',borderRadius:'99px',width:`${Math.min(100,g.progress*100)}%`,background:'linear-gradient(90deg,#6366f1,#8b5cf6)'}}/>
                                    </div>
                                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#64748b'}}>
                                        <span>{money(g.current)} / {money(g.target)}</span>
                                        <span>{money(g.monthlyRequired)}/mo · {g.monthsLeft}mo left</span>
                                    </div>
                                </div>
                            ))}
                            <MosBtn onClick={runGoalAutopilot} variant="secondary" style={{marginTop:'8px'}}>▶ Run Goal Autopilot</MosBtn>
                        </MosCard>

                        <MosCard title="📆 Cashflow Calendar">
                            <div style={{marginBottom:'12px',display:'flex',alignItems:'center',gap:'8px'}}>
                                <MosInput type="month" value={viewMonth} onChange={e=>setViewMonth(e.target.value)} style={{flex:1}}/>
                            </div>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'3px',marginBottom:'6px'}}>
                                {weekdayLabels().map(d=><div key={d} style={{textAlign:'center',fontSize:'9px',fontWeight:700,color:'#94a3b8',padding:'3px 0'}}>{d}</div>)}
                            </div>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'3px'}}>
                                {Array.from({length:new Date(viewMonth+'-01').getDay()},(_,i)=><div key={`pad-${i}`}/>)}
                                {monthCalendar.map(day=>(
                                    <div key={day.date} style={{borderRadius:'6px',padding:'3px',textAlign:'center',minHeight:'38px',background:day.income>0&&day.expense>0?'#eef2ff':day.income>0?'#f0fdf4':day.expense>0?'#fff1f2':'#f8fafc',border:'1px solid #f1f5f9'}}>
                                        <div style={{fontSize:'9px',fontWeight:700,color:'#64748b'}}>{day.dayNum}</div>
                                        {day.income>0&&<div style={{fontSize:'8px',color:'#10b981',fontWeight:700}}>+{money(day.income)}</div>}
                                        {day.expense>0&&<div style={{fontSize:'8px',color:'#f43f5e',fontWeight:700}}>-{money(day.expense)}</div>}
                                    </div>
                                ))}
                            </div>
                        </MosCard>

                        <MosCard title="📊 Reconciliation">
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                                <MosSelect value={statementForm.accountId} onChange={e=>setStatementForm({...statementForm,accountId:e.target.value})} style={{gridColumn:'1/-1'}}>
                                    {state.accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                                </MosSelect>
                                <MosInput type="month" value={statementForm.month} onChange={e=>setStatementForm({...statementForm,month:e.target.value})} style={{gridColumn:'1/-1'}}/>
                            </div>
                            {statementMetrics&&(
                                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                                    {[['Opening',statementMetrics.opening],['Closing',statementMetrics.closing],['Net Change',statementMetrics.monthDelta],['Tx Count',statementMetrics.txCount]].map(([l,v])=>(
                                        <div key={l} style={{padding:'10px',background:'#f8fafc',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
                                            <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:700}}>{l}</div>
                                            <div style={{fontSize:'14px',fontWeight:800,color:'#0f172a'}}>{typeof v==='number'?money(v):v}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                                <MosBtn onClick={()=>closeMonth(statementForm.month)} variant="danger">🔒 Close Month</MosBtn>
                                <MosBtn onClick={()=>reopenMonth(statementForm.month)} variant="ghost">🔓 Reopen</MosBtn>
                            </div>
                            {isMonthLocked(state,statementForm.month)&&<div style={{marginTop:'8px',padding:'8px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'8px',fontSize:'12px',color:'#f43f5e',fontWeight:600}}>🔒 Month is locked</div>}
                        </MosCard>
                    </div>
                )}

                {/* AUTOMATION */}
                {activeSection==='automation' && (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:'20px'}}>
                        <MosCard title="🤖 Autopilot">
                            <div style={{padding:'14px',background:'#f8fafc',borderRadius:'10px',marginBottom:'14px',border:'1px solid #e2e8f0'}}>
                                <label style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',marginBottom:'10px'}}>
                                    <div style={{position:'relative',width:'40px',height:'22px',background:state.autopilotSchedule?.enabled?'#6366f1':'#e2e8f0',borderRadius:'11px',transition:'background 0.2s',flexShrink:0}}
                                        onClick={()=>commitState(p=>({...p,autopilotSchedule:{...p.autopilotSchedule,enabled:!p.autopilotSchedule?.enabled}}),'toggle autopilot')}>
                                        <div style={{position:'absolute',top:'2px',left:state.autopilotSchedule?.enabled?'20px':'2px',width:'18px',height:'18px',background:'#fff',borderRadius:'50%',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
                                    </div>
                                    <span style={{fontWeight:700,fontSize:'13px'}}>Scheduler {state.autopilotSchedule?.enabled?'Enabled':'Disabled'}</span>
                                </label>
                                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                                    {[['runRecurring','Run recurring transactions'],['runDebt','Run debt autopilot'],['runGoals','Run goal funding']].map(([k,label])=>(
                                        <label key={k} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',cursor:'pointer'}}>
                                            <input type="checkbox" checked={state.autopilotSchedule?.[k]||false} onChange={e=>commitState(p=>({...p,autopilotSchedule:{...p.autopilotSchedule,[k]:e.target.checked}}),`toggle ${k}`)}/>
                                            {label}
                                        </label>
                                    ))}
                                </div>
                                <div style={{marginTop:'10px'}}>
                                    <div style={{fontSize:'11px',color:'#94a3b8',marginBottom:'4px',fontWeight:600}}>Next run date</div>
                                    <MosInput type="date" value={state.autopilotSchedule?.nextRunDate||todayStr()} onChange={e=>commitState(p=>({...p,autopilotSchedule:{...p.autopilotSchedule,nextRunDate:e.target.value}}),'set next run')}/>
                                </div>
                            </div>
                            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                                <MosBtn onClick={runScheduledAutomation} variant="primary">▶ Run Scheduler Now</MosBtn>
                                <MosBtn onClick={runDebtAutopilot} variant="secondary">Run Debt Autopilot</MosBtn>
                                <MosBtn onClick={runDueRecurring} variant="secondary">Run Recurring</MosBtn>
                            </div>
                        </MosCard>
                        <MosCard title="📋 Execution Logs">
                            {(state.executionLogs||[]).length===0&&<EmptyMsg>No automation logs yet.</EmptyMsg>}
                            <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'300px',overflowY:'auto'}}>
                                {(state.executionLogs||[]).map(log=>(
                                    <div key={log.id} style={{padding:'10px 12px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px',fontSize:'12px'}}>
                                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                                            <span style={{fontWeight:700,color:'#0f172a'}}>{log.action}</span>
                                            <span style={{padding:'2px 6px',borderRadius:'4px',background:log.status==='ok'?'#d1fae5':'#fef2f2',color:log.status==='ok'?'#059669':'#f43f5e',fontSize:'10px',fontWeight:700}}>{log.status}</span>
                                        </div>
                                        <div style={{color:'#64748b'}}>{log.summary}</div>
                                        <div style={{color:'#94a3b8',marginTop:'2px',fontSize:'10px'}}>{new Date(log.timestamp).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </MosCard>
                        <MosCard title="📜 Audit Trail">
                            {(state.auditTrail||[]).length===0&&<EmptyMsg>No audit events yet.</EmptyMsg>}
                            <div style={{display:'flex',flexDirection:'column',gap:'4px',maxHeight:'300px',overflowY:'auto'}}>
                                {(state.auditTrail||[]).map(event=>(
                                    <div key={event.id} style={{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'#f8fafc',borderRadius:'8px',fontSize:'12px',border:'1px solid #f1f5f9'}}>
                                        <span style={{fontWeight:600,color:'#0f172a'}}>{event.action}</span>
                                        <span style={{color:'#94a3b8',fontSize:'10px'}}>{new Date(event.timestamp).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </MosCard>
                    </div>
                )}

            </div>
        </section>
    );
}

function MosCard({title,children,style={}}) {
    return (
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'16px',padding:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)',...style}}>
            <h3 style={{margin:'0 0 16px',fontSize:'14px',fontWeight:800,color:'#0f172a'}}>{title}</h3>
            {children}
        </div>
    );
}

function MosBtn({children,onClick,type='button',variant='primary',disabled=false,small=false,style={}}) {
    const base={padding:small?'4px 10px':'8px 16px',borderRadius:'8px',border:'1px solid',fontSize:small?'11px':'12px',fontWeight:700,cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.4:1,transition:'opacity 0.15s',...style};
    const variants={
        primary:{background:'#6366f1',color:'#fff',borderColor:'#6366f1'},
        secondary:{background:'#f1f5f9',color:'#334155',borderColor:'#e2e8f0'},
        ghost:{background:'transparent',color:'#64748b',borderColor:'#e2e8f0'},
        danger:{background:'transparent',color:'#f43f5e',borderColor:'#fca5a5'},
    };
    return <button type={type} onClick={onClick} disabled={disabled} style={{...base,...variants[variant]}}>{children}</button>;
}

function MosInput({style={},type='text',...props}) {
    return <input type={type} {...props} style={{width:'100%',boxSizing:'border-box',padding:'8px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'13px',background:'#f8fafc',outline:'none',...style}}/>;
}

function MosSelect({children,style={},...props}) {
    return <select {...props} style={{width:'100%',boxSizing:'border-box',padding:'8px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'13px',background:'#f8fafc',outline:'none',...style}}>{children}</select>;
}

function EmptyMsg({children}) {
    return <div style={{padding:'16px',textAlign:'center',fontSize:'13px',color:'#94a3b8',fontWeight:500}}>{children}</div>;
}
