import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography, Alert, Button } from '@mui/material';
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

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const tableRef = useRef<HTMLDivElement | null>(null); 

  const fetchProducts = async (pageNumber: number) => {
    if (loading) return;
    setLoading(true);

    fetch(`http://localhost:8080/products?page=${pageNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        if (!data.results) {
          throw new Error('Products not found');
        }
        setProducts(prevProducts => [...prevProducts, ...data.results]); 
        setHasMore(data.next !== null);
      })
      .catch(error => {
        console.error('Error:', error);
        setError('An error occurred while fetching products');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleTableScroll = () => {
    const table = tableRef.current;

    if (table) {
      const { scrollTop, scrollHeight, clientHeight } = table;

      if (scrollTop + clientHeight >= scrollHeight - 10) {
        if (hasMore && !loading) {
          setPage(prevPage => prevPage + 1);
        }
      }
    }
  };

  const handleDeleteProduct = (productId: number) => {
    fetch(`http://localhost:8080/products/${productId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (response.ok) {
          setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
        } else {
          return response.json().then(err => {
            throw new Error(err.message || 'Error occurred while deleting the product');
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError('An error occurred while deleting the product');
      });
  }

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
  }

  const handleProductCreate = (newProduct: Product) => {
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  }

  return (
    <Box padding={4} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
      <Typography variant="h4" gutterBottom >
        Products
      </Typography>

      {error && (
        <Alert severity="error" style={{ marginBottom: '10px' }}>
          {error}
        </Alert>
      )}
      {products.length !== 0 && !loading && !error && 
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
                {products && products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img src={product.image_url} alt={product.name} style={{ width: 50, height: 50 }} />
                    </TableCell>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <DeleteIcon color='error' cursor='pointer' onClick={() => handleDeleteProduct(product.id)} />
                      <ModeEditOutlineIcon color='primary' cursor='pointer'  onClick={() => handleOpenEditModal(product)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>  
          <ProductModal openEditModal={openEditModal} setOpen={setOpenEditModal} product={selectedProduct}  onProductUpdate={handleProductUpdate} onProductCreate={handleProductCreate} />
          <Button style={{marginTop: 10}} variant="contained" color="primary" onClick={handleAddProduct}>Add Product</Button>
        </>
      }

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <CircularProgress />
        </div>
      )}
    </Box>
  );
}

export default App;
