import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(field_name="name", lookup_expr='icontains')  # Case-insensitive contains filter
    price = django_filters.RangeFilter()
    stock = django_filters.RangeFilter()


    class Meta:
        model = Product
        fields = ['name', 'price', 'stock']  

