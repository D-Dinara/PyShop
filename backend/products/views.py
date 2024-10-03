from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product
from .filters import ProductFilter
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    filterset_class = ProductFilter
    filter_backends = [DjangoFilterBackend]

    queryset = Product.objects.all()
    serializer_class = ProductSerializer

