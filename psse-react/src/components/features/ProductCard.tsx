import { FaShoppingCart, FaCartPlus } from 'react-icons/fa';
import { Card, CardImage, CardBody, Badge, Button } from '../common';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onOrder?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showPurchaseOptions?: boolean;
}

export const ProductCard = ({ product, onOrder, onAddToCart, showPurchaseOptions = true }: ProductCardProps) => {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Handler for primary action - uses onOrder if provided, otherwise onAddToCart
  const handlePrimaryAction = () => {
    if (onOrder) {
      onOrder(product);
    } else if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <Card className={`h-full flex flex-col ${isOutOfStock ? 'opacity-75' : ''}`}>
      <div className="relative">
        <CardImage src={product.image} alt={product.name} className="h-64" />
        {/* Stock Badges */}
        {isOutOfStock && (
          <Badge variant="danger" className="absolute top-3 right-3">
            Out of Stock
          </Badge>
        )}
        {isLowStock && (
          <Badge variant="warning" className="absolute top-3 right-3">
            Only {product.stock} left
          </Badge>
        )}
        {/* Featured Badge */}
        {product.featured && !isOutOfStock && !isLowStock && (
          <Badge variant="primary" className="absolute top-3 left-3">
            Featured
          </Badge>
        )}
      </div>
      <CardBody className="flex-1 flex flex-col">
        <h6 className="font-semibold text-gray-900 mb-2">{product.name}</h6>
        <p className="text-gray-600 text-sm flex-1">{product.description}</p>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-psse-accent">₱{product.price}</span>
            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
          </div>
          {showPurchaseOptions && (onAddToCart || onOrder) && (
            <div className="flex gap-2">
              {onAddToCart && onOrder && (
                <Button
                  variant="secondary"
                  disabled={isOutOfStock}
                  onClick={() => onAddToCart(product)}
                  className="flex-1"
                >
                  <FaCartPlus className="mr-1" />
                  Add
                </Button>
              )}
              <Button
                variant="primary"
                disabled={isOutOfStock}
                onClick={handlePrimaryAction}
                className={(onAddToCart && onOrder) ? 'flex-1' : 'w-full'}
              >
                <FaShoppingCart className="mr-1" />
                {isOutOfStock ? 'Out of Stock' : (onOrder ? 'Buy Now' : 'Add to Cart')}
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

