import * as React from 'react'; 
import { Box, Button, Typography, Modal, TextField } from '@mui/material';
import { Product } from './App';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface ProductModalProps {
  openEditModal: boolean;
  setOpen: (open: boolean) => void;
  product?: Product | null;
  onProductUpdate: (product: Product) => void;
  onProductCreate: () => void;
}

const baseURL = 'http://localhost:8080/products';

export default function ProductModal({ openEditModal, setOpen, product, onProductUpdate, onProductCreate }: ProductModalProps) {
  const [error, setError] = React.useState('');
  const [editedProduct, setEditedProduct] = React.useState<Product | null>(product || { id: 0, name: '', price: '', stock: '', image_url: '' });

  React.useEffect(() => {
    if (product) {
      setEditedProduct(product);
    } else {
      setEditedProduct({ id: 0, name: '', price: '', stock: '', image_url: '' });
    }
  }, [product]);

  const handleClose = () => {
    setOpen(false);
    setEditedProduct({ id: 0, name: '', price: '', stock: '', image_url: '' }); // Reset after close
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProduct(prevProduct => (prevProduct ? { ...prevProduct, [name]: value } : null));
  };

  const handleSubmitProduct = () => {
    if (!editedProduct?.name || !editedProduct?.price || !editedProduct?.stock || !editedProduct?.image_url) {
      setError('All fields are required');
      return;
    }

    const method = product ? 'PATCH' : 'POST'; 
    const url = product ? `${baseURL}/${editedProduct.id}/` : `${baseURL}/`;

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedProduct)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
      })
      .then(data => {
        setOpen(false);
        product ? onProductUpdate(data) : onProductCreate();
      })
      .catch(error => {
        console.error('Error:', error);
        setError('An error occurred while editing the product');
      });
  };

  return (
    <Modal
      open={openEditModal}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {product ? 'Edit Product' : 'Add Product'}
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Name"
          name="name"
          value={editedProduct?.name || ''}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Price"
          name="price"
          value={editedProduct?.price || ''}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Stock"
          name="stock"
          value={editedProduct?.stock || ''}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Image URL"
          name="image_url"
          value={editedProduct?.image_url || ''}
          onChange={handleInputChange}
        />

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Box display="flex" justifyContent="flex-end" marginTop={2}>
          <Button variant="contained" color="primary" onClick={handleSubmitProduct}>
            {product ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
