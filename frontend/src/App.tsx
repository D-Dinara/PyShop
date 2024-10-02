import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography } from '@mui/material';
import './App.css';

interface Product {
  id: number;
  name: string;
  price: string;  
  image_url: string;
  stock: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
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
        setProducts(prevProducts => [...prevProducts, ...data.results]); 
        setHasMore(data.next !== null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  return (
    <Box padding={4}>
      <Typography variant="h4" gutterBottom >
        Products
      </Typography>

      <TableContainer 
        component={Paper}
        ref={tableRef}
        onScroll={handleTableScroll}
        style={{ maxHeight: 400, overflowY: 'auto', width: 600 }} 
      >
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>In Stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img src={product.image_url} alt={product.name} style={{ width: 50, height: 50 }} />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <CircularProgress />
        </div>
      )}

    </Box>
  );
}

export default App;
