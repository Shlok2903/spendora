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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
  Chip,
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
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { expenseAPI, categoryAPI, subCategoryAPI } from '../lib/api';
import axios from '../lib/axiosConfig';
import { useToast } from '../context/ToastContext';

const Expenses = () => {
  // States for expenses and pagination
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  // States for expense form dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [currentExpense, setCurrentExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    expense_note: '',
    expense_amount: '',
    transaction_datetime: new Date().toISOString().slice(0, 16),
    category: '',
    subcategory: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // States for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // States for categories and subcategories
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  // Add toast functionality
  const toast = useToast();
  
  // Load expenses, categories, and subcategories when component mounts
  useEffect(() => {
    // Check for authentication token
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.warn('No access token found - user needs to log in first');
      setError('Please log in to view expenses and categories');
      setLoading(false);
      return;
    }
    
    console.log('Authenticated, fetching expenses and categories');
    fetchExpenses();
    fetchCategories();
  }, [page, rowsPerPage, searchQuery, selectedCategory]);

  // Fetch expenses with filters
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check for authentication token
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.warn('No access token found when fetching expenses');
        setError('Please log in to view expenses');
        setLoading(false);
        setExpenses([]);
        setTotalExpenses(0);
        return;
      }
      
      // Ensure the authorization header is set
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      let params = {
        page: page + 1,
        page_size: rowsPerPage,
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      console.log('Fetching expenses with params:', params);
      const response = await expenseAPI.getAll(params);
      console.log('Fetched expenses:', response.data);
      
      if (response.data && response.data.results) {
        setExpenses(response.data.results);
        setTotalExpenses(response.data.count || 0);
      } else if (Array.isArray(response.data)) {
        // Handle case where API returns array directly
        setExpenses(response.data);
        setTotalExpenses(response.data.length);
      } else {
        setExpenses([]);
        setTotalExpenses(0);
        console.warn('No results property found in response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Check for specific authentication errors
      if (error.response?.status === 401) {
        setError('Authentication error. Please log in again to view expenses.');
      } else {
        setError('Failed to fetch expenses. Please try again later.');
      }
      
      setExpenses([]);
      setTotalExpenses(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories for expense form');
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.warn('No access token found when fetching categories for expense form');
        setCategories([]);
        return;
      }
      
      const response = await categoryAPI.getAll();
      console.log('Categories response for expense form:', response);
      
      if (!response || !response.data) {
        console.warn('No response or empty data returned from category API for expense form');
        setCategories([]);
        return;
      }
      
      let categoryData = [];
      if (Array.isArray(response.data)) {
        categoryData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        categoryData = response.data.results;
      } else {
        console.warn('Unexpected format for categories in expense form:', response.data);
        setCategories([]);
        return;
      }
      
      console.log('Parsed categories for expense form:', categoryData);
      setCategories(categoryData);
    } catch (error) {
      console.error('Error fetching categories for expense form:', error);
      console.error('Error details:', error.response?.data || error.message);
      setCategories([]);
    }
  };

  // Fetch subcategories based on selected category
  const fetchSubcategories = async (categoryId) => {
    try {
      console.log('Fetching subcategories for expense form, category:', categoryId);
      
      // Check for authentication
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.warn('No access token found when fetching subcategories for expense form');
        setSubcategories([]);
        return;
      }
      
      // Make sure we have a valid categoryId
      if (!categoryId) {
        console.warn('No category ID provided for fetching subcategories');
        setSubcategories([]);
        return;
      }
      
      const response = await subCategoryAPI.getByCategory(categoryId);
      console.log('Subcategories response for expense form:', response);
      
      if (!response || !response.data) {
        console.warn('No response or empty data returned from subcategory API for expense form');
        setSubcategories([]);
        return;
      }
      
      let subcategoryData = [];
      if (Array.isArray(response.data)) {
        subcategoryData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        subcategoryData = response.data.results;
      } else {
        console.warn('Unexpected format for subcategories in expense form:', response.data);
        setSubcategories([]);
        return;
      }
      
      console.log('Parsed subcategories for expense form:', subcategoryData);
      setSubcategories(subcategoryData);
    } catch (error) {
      console.error('Error fetching subcategories for expense form:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Full error object:', error);
      setSubcategories([]);
    }
  };

  // Handle form value changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field '${name}' changed to:`, value);
    
    setExpenseForm({
      ...expenseForm,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // If category changes, fetch subcategories and reset selected subcategory
    if (name === 'category') {
      console.log('Category changed to:', value);
      
      if (value) {
        console.log('Fetching subcategories for selected category');
        fetchSubcategories(value);
      } else {
        console.log('No category selected, clearing subcategories');
        setSubcategories([]);
      }
      
      // Always reset subcategory when category changes
      setExpenseForm(prevForm => ({
        ...prevForm,
        subcategory: ''
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    if (!expenseForm.expense_note.trim()) {
      errors.expense_note = 'Note is required';
    }
    
    if (!expenseForm.expense_amount) {
      errors.expense_amount = 'Amount is required';
    } else if (isNaN(expenseForm.expense_amount) || parseFloat(expenseForm.expense_amount) <= 0) {
      errors.expense_amount = 'Amount must be a positive number';
    }
    
    if (!expenseForm.transaction_datetime) {
      errors.transaction_datetime = 'Date and time are required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle dialog open for creating a new expense
  const handleCreateExpense = () => {
    console.log('Opening create expense dialog, fetching fresh categories');
    setDialogTitle('Add New Expense');
    setCurrentExpense(null);
    setExpenseForm({
      expense_note: '',
      expense_amount: '',
      transaction_datetime: new Date().toISOString().slice(0, 16),
      category: '',
      subcategory: ''
    });
    setFormErrors({});
    
    // Explicitly fetch categories again when opening the dialog
    fetchCategories();
    
    setOpenDialog(true);
  };

  // Handle dialog open for editing an existing expense
  const handleEditExpense = (expense) => {
    console.log('Opening edit expense dialog for expense:', expense);
    setDialogTitle('Edit Expense');
    setCurrentExpense(expense);
    
    // Safely format the datetime value for the input
    let transactionDateTime = expense.transaction_datetime;
    if (transactionDateTime && transactionDateTime.length > 16) {
      transactionDateTime = transactionDateTime.slice(0, 16);
    }
    
    // Carefully extract category and subcategory IDs
    const categoryId = expense.category?.id || expense.category || '';
    const subcategoryId = expense.subcategory?.id || expense.subcategory || '';
    
    console.log('Extracted categoryId:', categoryId, 'and subcategoryId:', subcategoryId);
    
    setExpenseForm({
      expense_note: expense.expense_note || '',
      expense_amount: expense.expense_amount || '',
      transaction_datetime: transactionDateTime || new Date().toISOString().slice(0, 16),
      category: categoryId,
      subcategory: subcategoryId
    });
    
    // Explicitly fetch categories again when opening the dialog
    fetchCategories();
    
    // Safely fetch subcategories if category exists
    if (categoryId) {
      console.log('Fetching subcategories for category:', categoryId);
      fetchSubcategories(categoryId);
    } else {
      console.log('No category ID available, not fetching subcategories');
      setSubcategories([]);
    }
    
    setFormErrors({});
    setOpenDialog(true);
  };

  // Handle form submission (create or update expense)
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.warning('Please fix the form errors before submitting.');
      return;
    }
    
    try {
      const expenseData = {
        expense_note: expenseForm.expense_note,
        expense_amount: parseFloat(expenseForm.expense_amount),
        transaction_datetime: expenseForm.transaction_datetime,
        category: expenseForm.category || null,
        subcategory: expenseForm.subcategory || null
      };
      
      console.log('Submitting expense data:', expenseData);
      
      if (currentExpense) {
        // Update existing expense
        const response = await expenseAPI.update(currentExpense.id, expenseData);
        console.log('Expense updated successfully:', response.data);
        toast.success('Expense updated successfully!');
      } else {
        // Create new expense
        const response = await expenseAPI.create(expenseData);
        console.log('Expense created successfully:', response.data);
        toast.success('Expense created successfully!');
      }
      
      setOpenDialog(false);
      // Force a refetch of expenses
      setTimeout(() => {
        fetchExpenses();
      }, 300);
    } catch (error) {
      console.error('Error saving expense:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to save expense: ${error.response?.data ? 
        (typeof error.response.data === 'object' ? 
          Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ') : 
          error.response.data) : 
        error.message}`);
    }
  };

  // Handle expense deletion
  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(expenseId);
        toast.success('Expense deleted successfully!');
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error(`Failed to delete expense: ${error.message}`);
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

  // Handle search and filters
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPage(0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Add a function to manually refresh auth and retry fetching
  const refreshAuthAndRetry = () => {
    console.log('Attempting to refresh authentication and retry');
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken && !refreshToken) {
      setError('You need to log in first to view expenses and categories');
      return;
    }
    
    // Update axios headers with token if it exists
    if (accessToken) {
      console.log('Setting authorization header with stored token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // Retry fetching data
    fetchExpenses();
    fetchCategories();
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
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => {
                setError(null);
                fetchExpenses();
              }}
            >
              Try Again
            </Button>
            <Button 
              variant="outlined" 
              onClick={refreshAuthAndRetry}
            >
              Refresh Authentication & Retry
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateExpense}
          sx={{ my: 1 }}
        >
          Add Expense
        </Button>
      </Box>

      {/* Search and filters */}
      <Paper sx={{ p: 2, mb: 3, boxShadow: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Divider />
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search expenses"
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
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={!searchQuery && !selectedCategory}
              sx={{ height: '100%' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Expenses table */}
      <Paper sx={{ boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Subcategory</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      No expenses found
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />} 
                      onClick={handleCreateExpense}
                      sx={{ mt: 1 }}
                    >
                      Add Your First Expense
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id} hover sx={{ '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' } }}>
                    <TableCell>{formatDate(expense.transaction_datetime)}</TableCell>
                    <TableCell>{expense.expense_note}</TableCell>
                    <TableCell>
                      {expense.category_name ? (
                        <Chip label={expense.category_name} size="small" color="primary" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Uncategorized
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.subcategory_name ? (
                        <Chip label={expense.subcategory_name} size="small" color="secondary" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          None
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="error">
                        ₹{parseFloat(expense.expense_amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditExpense(expense)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteExpense(expense.id)}>
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
          count={totalExpenses}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Expense form dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note"
                name="expense_note"
                value={expenseForm.expense_note}
                onChange={handleFormChange}
                error={!!formErrors.expense_note}
                helperText={formErrors.expense_note}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                name="expense_amount"
                type="number"
                value={expenseForm.expense_amount}
                onChange={handleFormChange}
                error={!!formErrors.expense_amount}
                helperText={formErrors.expense_amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date and Time"
                name="transaction_datetime"
                type="datetime-local"
                value={expenseForm.transaction_datetime ? expenseForm.transaction_datetime : ''}
                onChange={handleFormChange}
                error={!!formErrors.transaction_datetime}
                helperText={formErrors.transaction_datetime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={expenseForm.category}
                  label="Category"
                  onChange={handleFormChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {console.log('Rendering categories dropdown with categories:', categories)}
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No categories found
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth disabled={!expenseForm.category}>
                <InputLabel id="subcategory-label">Subcategory</InputLabel>
                <Select
                  labelId="subcategory-label"
                  id="subcategory"
                  name="subcategory"
                  value={expenseForm.subcategory}
                  label="Subcategory"
                  onChange={handleFormChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {console.log('Rendering subcategories dropdown with:', subcategories, 'and selected category:', expenseForm.category)}
                  {subcategories.length > 0 ? (
                    subcategories.map((subcategory) => (
                      <MenuItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </MenuItem>
                    ))
                  ) : (
                    expenseForm.category && (
                      <MenuItem disabled value="">
                        No subcategories found for this category
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {currentExpense ? 'Update' : 'Add'} Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses; 