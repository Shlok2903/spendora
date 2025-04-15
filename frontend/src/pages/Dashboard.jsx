import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Divider,
  CircularProgress,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Label
} from 'recharts';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon, 
  Wallet as WalletIcon,
  DateRange as DateRangeIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { expenseAPI, incomeAPI, categoryAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

// Color palette for charts
const COLORS = ['#2e7d32', '#1976d2', '#9c27b0', '#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#00bcd4', '#9e9e9e'];

const Dashboard = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [loading, setLoading] = useState(true);
  const [expenseSummary, setExpenseSummary] = useState({
    total_amount: 0,
    category_expenses: [],
    monthly_expenses: []
  });
  const [incomeSummary, setIncomeSummary] = useState({
    total_income: 0,
    income_sources: [],
    sources_count: 0
  });
  const [timeFilter, setTimeFilter] = useState('month'); // 'week', 'month', 'year'
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch expense summary
        const summaryRes = await expenseAPI.getSummary({ period: timeFilter });
        setExpenseSummary(summaryRes.data);
        
        // Fetch income summary
        const incomeRes = await incomeAPI.getTotal();
        setIncomeSummary(incomeRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeFilter]);

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
  };

  // Process chart data
  const monthlyExpenses = expenseSummary.monthly_expenses || [];
  const categoryExpenses = expenseSummary.category_expenses?.map(cat => ({
    name: cat.category__name || 'Uncategorized',
    value: parseFloat(cat.total_amount)
  })) || [];

  // Calculate savings (income - expenses)
  const totalExpenses = expenseSummary.total_amount || 0;
  const totalIncome = incomeSummary.total_income || 0;
  const savings = totalIncome - totalExpenses;
  const savingsPercentage = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  // Summary cards with key metrics
  const SummaryCard = ({ title, amount, icon, color, subtitle }) => (
    <Card className="summary-card">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle1" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
              ₹{amount.toFixed(2)}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              backgroundColor: `${color}.light`, 
              p: 1.5, 
              borderRadius: '50%', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          py: 10
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="dashboard-container">
      <Box className="dashboard-header">
        <Typography variant="h4" component="h1">
          Hello, {user?.first_name || 'User'}!
        </Typography>
        
        <div className="filter-controls">
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel id="time-filter-label">Time Period</InputLabel>
            <Select
              labelId="time-filter-label"
              id="time-filter"
              value={timeFilter}
              label="Time Period"
              onChange={handleTimeFilterChange}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
        </div>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Total Expenses"
            amount={totalExpenses}
            icon={<TrendingDownIcon sx={{ color: 'error.main', fontSize: 28 }} />}
            color="error"
            subtitle={`For ${timeFilter === 'week' ? 'this week' : timeFilter === 'month' ? 'this month' : 'this year'}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Total Income"
            amount={totalIncome}
            icon={<TrendingUpIcon sx={{ color: 'success.main', fontSize: 28 }} />}
            color="success"
            subtitle={`From ${incomeSummary.sources_count || 0} income sources`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Savings"
            amount={savings}
            icon={<WalletIcon sx={{ color: 'info.main', fontSize: 28 }} />}
            color="info"
            subtitle={`${savingsPercentage.toFixed(1)}% of income`}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Main Charts */}
        <Grid item xs={12} lg={8}>
          {/* Expense Trend Chart */}
          <Paper className="chart-paper chart-container">
            <Typography variant="h6" gutterBottom>
              Expense Trend
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {monthlyExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlyExpenses}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis>
                    <Label
                      value="Amount (₹)"
                      angle={-90}
                      position="insideLeft"
                      style={{ textAnchor: 'middle' }}
                    />
                  </YAxis>
                  <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                  <Legend />
                  <Bar dataKey="total_amount" fill="#2e7d32" name="Expense Amount" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No expense data available for this period
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Income Sources Table */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Income Sources
              </Typography>
              <CurrencyRupeeIcon color="success" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {incomeSummary.income_sources && incomeSummary.income_sources.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Payment Day</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incomeSummary.income_sources.map((source, index) => (
                      <TableRow key={index}>
                        <TableCell>{source.description}</TableCell>
                        <TableCell align="right">₹{parseFloat(source.amount).toFixed(2)}</TableCell>
                        <TableCell align="right">{source.payment_day}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No income sources added yet
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  href="/income"
                >
                  Add Income Source
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Side Charts */}
        <Grid item xs={12} lg={4}>
          {/* Category Expenses */}
          <Paper className="chart-paper chart-container">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Expenses by Category
              </Typography>
              <CategoryIcon color="primary" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {categoryExpenses.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                
                <Divider sx={{ my: 2 }} />
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categoryExpenses.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.name}</TableCell>
                          <TableCell align="right">₹{entry.value.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            {totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).toFixed(1) : 0}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No category data available for this period
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 