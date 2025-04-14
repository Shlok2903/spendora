import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Divider,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { incomeAPI } from '../lib/api';

const Income = () => {
  // States for income and pagination
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
  
  // States for income form dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [currentIncome, setCurrentIncome] = useState(null);
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    everymonth_payment_date: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // States for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load incomes when component mounts
  useEffect(() => {
    fetchIncomes();
    fetchTotalIncome();
  }, [page, rowsPerPage, searchQuery]);

  // Fetch incomes with search filter
  const fetchIncomes = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching incomes');
      const response = await incomeAPI.getAll();
      console.log('Fetched incomes response:', response.data);
      
      if (!response.data) {
        console.warn('No data returned from income API');
        setIncomes([]);
        setTotalIncomes(0);
        setLoading(false);
        return;
      }
      
      // Handle both array and paginated responses
      let incomesData = response.data;
      if (response.data.results) {
        incomesData = response.data.results;
        setTotalIncomes(response.data.count || 0);
      } else if (Array.isArray(response.data)) {
        incomesData = response.data;
        setTotalIncomes(response.data.length);
      } else {
        console.warn('Unexpected format for income data:', response.data);
        setIncomes([]);
        setTotalIncomes(0);
        setLoading(false);
        return;
      }
      
      // Apply client-side filtering if search query exists
      let filteredIncomes = incomesData;
      if (searchQuery && filteredIncomes.length > 0) {
        const query = searchQuery.toLowerCase();
        filteredIncomes = incomesData.filter(income => 
          income.description && income.description.toLowerCase().includes(query)
        );
      }
      
      // Calculate total count
      setTotalIncomes(filteredIncomes.length);
      
      // Apply pagination if not already paginated from the server
      if (!response.data.results) {
        const paginatedIncomes = filteredIncomes.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        );
        setIncomes(paginatedIncomes);
      } else {
        setIncomes(filteredIncomes);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
      console.error('Error details:', error.response?.data || error.message);
      setIncomes([]);
      setTotalIncomes(0);
      setError('Failed to fetch income data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch total income
  const fetchTotalIncome = async () => {
    try {
      const response = await incomeAPI.getTotal();
      console.log('Fetched total income:', response.data);
      if (response.data && response.data.total_income !== undefined) {
        setTotalMonthlyIncome(response.data.total_income || 0);
      } else {
        console.warn('Total income data not found:', response.data);
      }
    } catch (error) {
      console.error('Error fetching total income:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  // Handle form value changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setIncomeForm({
      ...incomeForm,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    if (!incomeForm.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!incomeForm.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(incomeForm.amount) || parseFloat(incomeForm.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    if (!incomeForm.everymonth_payment_date) {
      errors.everymonth_payment_date = 'Payment date is required';
    } else {
      const paymentDate = parseInt(incomeForm.everymonth_payment_date);
      if (isNaN(paymentDate) || paymentDate < 1 || paymentDate > 31) {
        errors.everymonth_payment_date = 'Payment date must be between 1 and 31';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle dialog open for creating a new income
  const handleCreateIncome = () => {
    setDialogTitle('Add New Income');
    setCurrentIncome(null);
    setIncomeForm({
      amount: '',
      everymonth_payment_date: '',
      description: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Handle dialog open for editing an existing income
  const handleEditIncome = (income) => {
    setDialogTitle('Edit Income');
    setCurrentIncome(income);
    setIncomeForm({
      amount: income.amount || '',
      everymonth_payment_date: income.everymonth_payment_date || '',
      description: income.description || ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Handle form submission (create or update income)
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const incomeData = {
        amount: parseFloat(incomeForm.amount),
        everymonth_payment_date: parseInt(incomeForm.everymonth_payment_date),
        description: incomeForm.description
      };
      
      console.log('Submitting income data:', incomeData);
      
      if (currentIncome) {
        // Update existing income
        const response = await incomeAPI.update(currentIncome.id, incomeData);
        console.log('Income updated successfully:', response.data);
      } else {
        // Create new income
        const response = await incomeAPI.create(incomeData);
        console.log('Income created successfully:', response.data);
      }
      
      setOpenDialog(false);
      // Force a refetch after a short delay
      setTimeout(() => {
        fetchIncomes();
        fetchTotalIncome();
      }, 300);
    } catch (error) {
      console.error('Error saving income:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to save income: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  // Handle income deletion
  const handleDeleteIncome = async (incomeId) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await incomeAPI.delete(incomeId);
        fetchIncomes();
        fetchTotalIncome();
      } catch (error) {
        console.error('Error deleting income:', error);
        console.error('Error details:', error.response?.data || error.message);
        alert(`Failed to delete income: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      }
    }
  };

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  // Render error state
  if (error && !loading) {
    return (
      <Box sx={{ maxWidth: '1600px', mx: 'auto', py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', boxShadow: 2 }}>
          <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setError(null);
              fetchIncomes();
              fetchTotalIncome();
            }}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Income
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateIncome}
          sx={{ my: 1 }}
        >
          Add Income
        </Button>
      </Box>

      {/* Income summary */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white', boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom>
          Total Monthly Income
        </Typography>
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
        ₹{totalMonthlyIncome.toFixed(2)}
        </Typography>
      </Paper>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, boxShadow: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search
          </Typography>
          <Divider />
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search income sources"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClearSearch}
              disabled={!searchQuery}
              variant="outlined"
              sx={{ height: '100%' }}
            >
              Clear Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Income table */}
      <Paper sx={{ boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Monthly Payment Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : incomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      No income sources found
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />} 
                      onClick={handleCreateIncome}
                      sx={{ mt: 1 }}
                    >
                      Add Your First Income
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                incomes.map((income) => (
                  <TableRow key={income.id} hover sx={{ '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' } }}>
                    <TableCell>
                      Day {income.everymonth_payment_date}
                    </TableCell>
                    <TableCell>{income.description}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ₹{parseFloat(income.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditIncome(income)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteIncome(income.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalIncomes}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Income form dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={incomeForm.description}
                onChange={handleFormChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                placeholder="e.g., Salary, Freelance work, Rent income"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={incomeForm.amount}
                onChange={handleFormChange}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                placeholder="Monthly income amount"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                name="everymonth_payment_date"
                type="number"
                value={incomeForm.everymonth_payment_date}
                onChange={handleFormChange}
                error={!!formErrors.everymonth_payment_date}
                helperText={formErrors.everymonth_payment_date || "Day of the month when payment is received (1-31)"}
                inputProps={{ min: 1, max: 31 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {currentIncome ? 'Update' : 'Add'} Income
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Income; 