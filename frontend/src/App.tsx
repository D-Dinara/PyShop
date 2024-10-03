import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography, Alert, Button, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import './App.css';
import ProductModal from './ProductModal';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';

export interface Product {
  id: number;
  name: string;
  price: string;
  image_url: string;
  stock: string;
}

const baseURL = 'http://localhost:8080/products';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>(''); // State for the filter input
  const [filterField, setFilterField] = useState<string>('name'); // State for selected filter field

  const tableRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);

  const fetchProducts = async (pageNumber: number) => {
    if (loading) return;
    setLoading(true);

    // Build the query parameters for filtering
    let filterParams = '';
    if (filterQuery) {
      filterParams = `&${filterField}=${filterQuery}`;
    }

    try {
      const response = await fetch(`${baseURL}?page=${pageNumber}${filterParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      console.log('Data:', data);

      if (!data.results) {
        throw new Error('Products not found');
      }

      setFilteredProducts(data.results);
      setHasMore(data.next !== null);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page, filterQuery]);

  const handleTableScroll = () => {
    const table = tableRef.current;
    if (table) {
      const { scrollTop, scrollHeight, clientHeight } = table;
      scrollPositionRef.current = scrollTop;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        if (hasMore && !loading) {
          setPage(prevPage => prevPage + 1);
        }
      }
    }
  };

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [products]);

  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await fetch(`${baseURL}/${productId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error occurred while deleting the product');
      }

      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while deleting the product');
    }
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setOpenEditModal(true);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setOpenEditModal(true);
  };

  const handleProductCreate = () => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1);
  };

  return (
    <Box padding={4} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>

      {/* Filter selection */}
      <Box display="flex" justifyContent="center" gap={2} marginBottom={3}>
        {/* Dropdown to pick filter field */}
        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel id="filter-field-label">Filter By</InputLabel>
          <Select
            labelId="filter-field-label"
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            label="Filter By"
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="price">Price</MenuItem>
            <MenuItem value="stock">Stock</MenuItem>
          </Select>
        </FormControl>

        {/* TextField to input filter query */}
        <TextField
          label="Enter Filter Query"
          variant="outlined"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          style={{ minWidth: 400 }}
        />
      </Box>

      {error && (
        <Alert severity="error" style={{ marginBottom: '10px' }}>
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <>
          <TableContainer
            component={Paper}
            ref={tableRef}
            onScroll={handleTableScroll}
            style={{ maxHeight: 400, overflowY: 'auto', width: 600, margin: 'auto' }}
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>In Stock</TableCell>
                  <TableCell align='center'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img src={product.image_url} alt={product.name} style={{ width: 50, height: 50 }} />
                    </TableCell>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell align='center'>
                      <DeleteIcon color='error' style={{ cursor: 'pointer' }} onClick={() => handleDeleteProduct(product.id)} />
                      <ModeEditOutlineIcon color='primary' style={{ cursor: 'pointer' }} onClick={() => handleOpenEditModal(product)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <ProductModal openEditModal={openEditModal} setOpen={setOpenEditModal} product={selectedProduct} onProductUpdate={handleProductUpdate} onProductCreate={handleProductCreate} />
          <Button style={{ marginTop: 10 }} variant="contained" color="primary" onClick={handleAddProduct}>Add Product</Button>
        </>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <CircularProgress />
        </div>
      )}
    </Box>
  );
}

export default App;
