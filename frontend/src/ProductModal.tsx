import * as React from 'react'; 
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Product } from './App';
import { TextField } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
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
  onProductCreate: (product: Product) => void;
}

export default function ProductModal({ openEditModal, setOpen, product, onProductUpdate, onProductCreate }: ProductModalProps) {
  const [error, setError] = React.useState('');
  
  const [editedProduct, setEditedProduct] = React.useState<Product | null>(product || { id: 0, name: '', price: '', stock: '', image_url: '' });

  React.useEffect(() => {
    if (product) {
      setEditedProduct(product); 
    } else {
      setEditedProduct({ name: '', price: '', stock: '', image_url: '', id: 0 });
    }
  }, [product]);

  const handleClose = () => setOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProduct(prevProduct => (prevProduct ? { ...prevProduct, [name]: value } : null));
  };

  const handleSubmitProduct = () => {
    if (!editedProduct) {
      setError('Product not found');
      return;
    }

    const method = product ? 'PATCH' : 'POST'; 
    const url = product ? `http://localhost:8080/products/${editedProduct.id}/` : 'http://localhost:8080/products/'; 

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editedProduct.name,
        price: editedProduct.price,
        stock: editedProduct.stock,
        image_url: editedProduct.image_url,
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setOpen(false);
        product ? onProductUpdate(data) : onProductCreate(data);
      })
      .catch(error => {
        console.error('Error:', error);
        setError('An error occurred while editing or creating the product');
      });
  };

  return (
    <div>
      <Modal
        open={openEditModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" margin={1}>
            {product ? 'Edit Product' : 'Add Product'}
          </Typography>
          {error && (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          )}
          {editedProduct && 
            <Box
              display='flex'
              flexDirection='column'
              component="form"
              sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
              noValidate
              autoComplete="true"
              >
              <TextField
                fullWidth
                required
                id="name"
                label="Name"
                name='name'
                value={editedProduct.name}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                required
                id="price"
                label="Price"
                name='price'
                value={editedProduct.price}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                required
                id="stock"
                label="Stock"
                name='stock'
                value={editedProduct.stock}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                required
                id="image_url"
                label="Image URL"
                name='image_url'
                value={editedProduct.image_url}
                onChange={handleInputChange}
              />
              <Button onClick={handleSubmitProduct} variant="contained" color="primary" type='button'>
                {product ? 'Update' : 'Add'}
              </Button>
            </Box>
          }
        </Box>
      </Modal>
    </div>
  );
}
