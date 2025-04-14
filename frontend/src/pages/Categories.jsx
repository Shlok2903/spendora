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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { categoryAPI, subCategoryAPI } from '../lib/api';
import axios from '../lib/axiosConfig';

const Categories = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // States for categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  
  // States for category dialog
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [categoryDialogTitle, setCategoryDialogTitle] = useState('');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  const [categoryFormErrors, setCategoryFormErrors] = useState({});
  
  // States for subcategory dialog
  const [subcategoryDialog, setSubcategoryDialog] = useState(false);
  const [subcategoryDialogTitle, setSubcategoryDialogTitle] = useState('');
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [subcategoryFormErrors, setSubcategoryFormErrors] = useState({});
  
  // State for expanded accordion
  const [expanded, setExpanded] = useState(false);
  
  // Load categories when component mounts
  useEffect(() => {
    // Check if we have an auth token before fetching
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      console.log('Access token found, fetching categories');
      fetchCategories();
    } else {
      console.warn('No access token found - user needs to log in first');
      setError('Please log in to view categories');
      setLoading(false);
    }
  }, [categorySearch]);

  // Fetch categories with search filter
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching categories - START');
      const response = await categoryAPI.getAll();
      console.log('Fetching categories - RESPONSE:', response);
      
      if (!response || !response.data) {
        console.warn('No response or empty data returned from category API');
        setCategories([]);
        setError('Failed to fetch categories: Empty response');
        setLoading(false);
        return;
      }
      
      if (!Array.isArray(response.data)) {
        console.warn('Unexpected format for categories (not an array):', response.data);
        // Try to adapt to different response formats
        if (response.data.results && Array.isArray(response.data.results)) {
          console.log('Using results property from response');
          response.data = response.data.results;
        } else {
          setCategories([]);
          setError('Failed to fetch categories: Unexpected data format');
          setLoading(false);
          return;
        }
      }
      
      // Apply client-side filtering if search query exists
      let filteredCategories = response.data;
      console.log('Categories before filtering:', filteredCategories);
      
      if (categorySearch) {
        const query = categorySearch.toLowerCase();
        filteredCategories = response.data.filter(cat => 
          cat.name.toLowerCase().includes(query) || 
          (cat.description && cat.description.toLowerCase().includes(query))
        );
        console.log('Categories after filtering:', filteredCategories);
      }
      
      // For each category, fetch its subcategories
      console.log('Fetching subcategories for each category');
      const categoriesWithSubcategories = await Promise.all(
        filteredCategories.map(async (category) => {
          try {
            console.log(`Fetching subcategories for category ${category.id}`);
            const subResponse = await subCategoryAPI.getByCategory(category.id);
            console.log(`Subcategory response for category ${category.id}:`, subResponse);
            
            // Make sure we have subcategories as an array
            let subcategories = [];
            if (subResponse && subResponse.data) {
              if (Array.isArray(subResponse.data)) {
                subcategories = subResponse.data;
              } else if (subResponse.data.results && Array.isArray(subResponse.data.results)) {
                subcategories = subResponse.data.results;
              } else {
                console.warn(`Unexpected subcategory format for category ${category.id}:`, subResponse.data);
              }
            }
            
            return {
              ...category,
              subcategories
            };
          } catch (error) {
            console.error(`Error fetching subcategories for category ${category.id}:`, error);
            console.error('Full error details:', error.response?.data || error.message);
            return {
              ...category,
              subcategories: []
            };
          }
        })
      );
      
      console.log('Final categories with subcategories:', categoriesWithSubcategories);
      setCategories(categoriesWithSubcategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.detail || error.message || 'Failed to load categories. Please try again later.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle accordion expansion
  const handleAccordionChange = (categoryId) => (event, isExpanded) => {
    setExpanded(isExpanded ? categoryId : false);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Category form functions
  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (categoryFormErrors[name]) {
      setCategoryFormErrors({
        ...categoryFormErrors,
        [name]: ''
      });
    }
  };

  const validateCategoryForm = () => {
    const errors = {};
    
    if (!categoryForm.name.trim()) {
      errors.name = 'Name is required';
    }
    
    setCategoryFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Subcategory form functions
  const handleSubcategoryFormChange = (e) => {
    const { name, value } = e.target;
    setSubcategoryForm({
      ...subcategoryForm,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (subcategoryFormErrors[name]) {
      setSubcategoryFormErrors({
        ...subcategoryFormErrors,
        [name]: ''
      });
    }
  };

  const validateSubcategoryForm = () => {
    const errors = {};
    
    if (!subcategoryForm.name.trim()) {
      errors.name = 'Name is required';
    }
    
    setSubcategoryFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Dialog functions for Category
  const handleCreateCategory = () => {
    setCategoryDialogTitle('Add New Category');
    setCurrentCategory(null);
    setCategoryForm({
      name: '',
      description: ''
    });
    setCategoryFormErrors({});
    setCategoryDialog(true);
  };

  const handleEditCategory = (category) => {
    setCategoryDialogTitle('Edit Category');
    setCurrentCategory(category);
    setCategoryForm({
      name: category.name || '',
      description: category.description || ''
    });
    setCategoryFormErrors({});
    setCategoryDialog(true);
  };

  const handleCategorySubmit = async () => {
    if (!validateCategoryForm()) {
      return;
    }
    
    try {
      if (currentCategory) {
        // Update existing category
        await categoryAPI.update(currentCategory.id, categoryForm);
      } else {
        // Create new category
        await categoryAPI.create(categoryForm);
      }
      
      setCategoryDialog(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Failed to save category: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  // Dialog functions for Subcategory
  const handleCreateSubcategory = (categoryId, categoryName) => {
    setSubcategoryDialogTitle(`Add New Subcategory to ${categoryName}`);
    setCurrentSubcategory(null);
    setSelectedCategoryId(categoryId);
    setSubcategoryForm({
      name: '',
      description: '',
      category: categoryId
    });
    setSubcategoryFormErrors({});
    setSubcategoryDialog(true);
  };

  const handleEditSubcategory = (subcategory) => {
    setSubcategoryDialogTitle('Edit Subcategory');
    setCurrentSubcategory(subcategory);
    
    // Handle different subcategory formats (direct from API vs from category object)
    const categoryId = subcategory.category?.id || subcategory.category;
    
    setSelectedCategoryId(categoryId);
    setSubcategoryForm({
      name: subcategory.name || '',
      description: subcategory.description || '',
      category: categoryId
    });
    setSubcategoryFormErrors({});
    setSubcategoryDialog(true);
  };

  const handleSubcategorySubmit = async () => {
    if (!validateSubcategoryForm()) {
      return;
    }
    
    try {
      if (currentSubcategory) {
        // Update existing subcategory
        await subCategoryAPI.update(currentSubcategory.id, subcategoryForm);
      } else {
        // Create new subcategory
        await subCategoryAPI.create(subcategoryForm);
      }
      
      setSubcategoryDialog(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert(`Failed to save subcategory: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  // Delete functions
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      try {
        setLoading(true); // Add loading state during delete
        console.log(`Deleting category ${categoryId}`);
        await categoryAPI.delete(categoryId);
        console.log(`Category ${categoryId} deleted successfully`);
        fetchCategories();
      } catch (error) {
        console.error(`Error deleting category ${categoryId}:`, error);
        console.error('Error details:', error.response?.data || error.message);
        alert(`Failed to delete category: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
        setLoading(false); // Ensure loading state is reset if fetchCategories isn't called
      }
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await subCategoryAPI.delete(subcategoryId);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        alert(`Failed to delete subcategory: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      }
    }
  };

  // Handle search
  const handleCategorySearchChange = (e) => {
    setCategorySearch(e.target.value);
  };

  const handleClearCategorySearch = () => {
    setCategorySearch('');
  };

  // Add a function to manually refresh auth and retry fetching
  const refreshAuthAndRetry = () => {
    console.log('Attempting to refresh authentication and retry');
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken && !refreshToken) {
      setError('You need to log in first to view categories');
      return;
    }
    
    // Update axios headers with token if it exists
    if (accessToken) {
      console.log('Setting authorization header with stored token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // Retry fetching categories
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
                fetchCategories();
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
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCategory}
          sx={{ my: 1 }}
        >
          Add Category
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, boxShadow: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search
          </Typography>
          <Divider />
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              label="Search categories"
              variant="outlined"
              size="small"
              value={categorySearch}
              onChange={handleCategorySearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClearCategorySearch}
              disabled={!categorySearch}
              variant="outlined"
              sx={{ height: '100%' }}
            >
              Clear Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Categories List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, py: 5 }}>
          <CircularProgress size={40} />
        </Box>
      ) : categories.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', boxShadow: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No categories found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
            Categories help you organize your expenses and track spending patterns
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleCreateCategory}
            size="large"
          >
            Create First Category
          </Button>
        </Paper>
      ) : (
        <Box sx={{ mb: 4 }}>
          {categories.map((category) => (
            <Accordion 
              key={category.id} 
              expanded={expanded === category.id} 
              onChange={handleAccordionChange(category.id)}
              sx={{ 
                mb: 2, 
                boxShadow: 2, 
                borderRadius: '8px!important',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { mt: 0 }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  borderRadius: '8px',
                  '&.Mui-expanded': { minHeight: 48 }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {category.name}
                    </Typography>
                    {category.description && (
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    )}
                  </Box>
                  <Chip 
                    label={`${category.subcategories?.length || 0} subcategories`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2, pb: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleCreateSubcategory(category.id, category.name)}
                  >
                    Add Subcategory
                  </Button>
                  <Box sx={{ mx: 1 }} />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditCategory(category)}
                  >
                    Edit Category
                  </Button>
                  <Box sx={{ mx: 1 }} />
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    Delete Category
                  </Button>
                </Box>
                
                {category.subcategories && category.subcategories.length > 0 ? (
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                    {category.subcategories.map((subcategory) => (
                      <ListItem key={subcategory.id} sx={{ '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' } }}>
                        <ListItemText 
                          primary={<Typography fontWeight="medium">{subcategory.name}</Typography>}
                          secondary={subcategory.description}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Edit">
                            <IconButton 
                              edge="end" 
                              aria-label="edit" 
                              onClick={() => handleEditSubcategory(subcategory)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              edge="end" 
                              aria-label="delete" 
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No subcategories found
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleCreateSubcategory(category.id, category.name)}
                      sx={{ mt: 1 }}
                    >
                      Add Subcategory
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{categoryDialogTitle}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                name="name"
                value={categoryForm.name}
                onChange={handleCategoryFormChange}
                error={!!categoryFormErrors.name}
                helperText={categoryFormErrors.name}
                placeholder="e.g., Food, Transportation, Utilities"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryFormChange}
                multiline
                rows={2}
                placeholder="Brief description of the category"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCategorySubmit}>
            {currentCategory ? 'Update' : 'Add'} Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subcategoryDialog} onClose={() => setSubcategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{subcategoryDialogTitle}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subcategory Name"
                name="name"
                value={subcategoryForm.name}
                onChange={handleSubcategoryFormChange}
                error={!!subcategoryFormErrors.name}
                helperText={subcategoryFormErrors.name}
                placeholder="e.g., Groceries, Restaurants, Electricity"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={subcategoryForm.description}
                onChange={handleSubcategoryFormChange}
                multiline
                rows={2}
                placeholder="Brief description of the subcategory"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubcategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubcategorySubmit}>
            {currentSubcategory ? 'Update' : 'Add'} Subcategory
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories; 