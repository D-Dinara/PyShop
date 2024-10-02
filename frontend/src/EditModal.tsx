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

interface EditModalProps {
  openEditModal: boolean;
  setOpen: (open: boolean) => void;
  product: Product | null;
  onProductUpdate: (product: Product) => void;
}

export default function EditModal({ openEditModal, setOpen, product, onProductUpdate }: EditModalProps) {
  const [error, setError] = React.useState('');
  
  const [editedProduct, setEditedProduct] = React.useState<Product | null>(product);

  React.useEffect(() => {
    if (product) {
      setEditedProduct(product);
    }
  }, [product]);

  const handleClose = () => setOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProduct(prevProduct => (prevProduct ? { ...prevProduct, [name]: value } : null));
  };

  const handleEditProduct = () => {
    if (!editedProduct) {
      setError('Product not found');
      return;
    }
    fetch(`http://localhost:8080/products/${editedProduct.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editedProduct.name,
        price: editedProduct.price,
        stock: editedProduct.stock,
      })
    })
      .then(response => {
        if (response.ok) {
          setOpen(false);
          onProductUpdate(editedProduct);
        } else {
          return response.json().then(err => {
            throw new Error(err.message || 'Error occurred while editing the product');
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError('An error occurred while editing the product');
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
            Edit Product
          </Typography>
          {error && (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          )}
          {editedProduct && 
            <Box
              component="form"
              sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
              noValidate
              autoComplete="off"
              >
              <TextField
                required
                id="name"
                label="Name"
                name='name'
                value={editedProduct.name}
                onChange={handleInputChange}
              />
              <TextField
                required
                id="price"
                label="Price"
                name='price'
                value={editedProduct.price}
                onChange={handleInputChange}
              />
              <TextField
                required
                id="stock"
                label="Stock"
                name='stock'
                value={editedProduct.stock}
                onChange={handleInputChange}
              />
              <Button onClick={handleEditProduct} variant="contained" color="primary" type='button'>
                Update
              </Button>
            </Box>
          }
        </Box>
      </Modal>
    </div>
  );
}
