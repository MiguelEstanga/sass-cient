"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/product.schema";
import type { Product } from "@/types/product.types";
import styles from "../styles/ProductForm.module.css";
// Normalmente cargarías esto de un store o servicio de categorías
interface CategoryOption {
  value: number;
  label: string;
}

interface Props {
  defaultValues?: Partial<Product>;
  categories: CategoryOption[]; // Pasamos las categorías por props
  onSubmit: (values: ProductFormValues, image: File | null) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProductForm({
  defaultValues,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    // 💡 AGREGA ESTO:
    defaultValues: {
      name: "",
      description: "",
      category_id: 0,
      barcode: "",
      price: 0,
      cost_price: 0,
      stock: 0,
      min_stock: 0,
      discount: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        description: defaultValues.description ?? "",
        category_id: defaultValues.category_id ?? 0,
        barcode: defaultValues.barcode ?? "",
        price: defaultValues.price ? parseFloat(defaultValues.price) : 0,
        cost_price: defaultValues.cost_price
          ? parseFloat(defaultValues.cost_price)
          : 0,
        stock: defaultValues.stock ?? 0,
        min_stock: defaultValues.min_stock ?? 0,
        discount: defaultValues.discount
          ? parseFloat(defaultValues.discount)
          : 0,
        is_active: defaultValues.is_active ?? true,
      });
      setImagePreview(defaultValues.image_url ?? null);
    } else {
      reset({
        name: "",
        category_id: 0,
        price: 0,
        cost_price: 0,
        stock: 0,
        min_stock: 0,
        discount: 0,
        is_active: true,
      });
      setImagePreview(null);
    }
    setSelectedFile(null); // Limpiar archivo al cambiar de modo
  }, [defaultValues, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    await onSubmit(values, selectedFile);
  };

  const isActive = watch("is_active");

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={styles.form}
      noValidate
    >
      {/* Imagen */}
      <div className={styles.imageSection}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={styles.fileInput}
          id="product-image"
        />
        <label htmlFor="product-image" className={styles.imageLabel}>
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Vista previa"
              className={styles.preview}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>Subir Imagen</span>
            </div>
          )}
        </label>
      </div>

      <Input
        label="Nombre del producto"
        placeholder="Ej: Laptop Gamer"
        fullWidth
        required
        error={errors.name?.message}
        {...register("name")}
      />

      <TextArea
        label="Descripción"
        placeholder="Detalles del producto..."
        fullWidth
        error={errors.description?.message}
        {...register("description")}
      />

      <div className={styles.row}>
        <Select
          label="Categoría"
          options={categories}
          placeholder="Seleccionar..."
          fullWidth
          error={errors.category_id?.message}
          {...register("category_id", { valueAsNumber: true })}
        />
        <Input
          label="Código de barras"
          placeholder="BC-00001"
          fullWidth
          error={errors.barcode?.message}
          {...register("barcode")}
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Precio de costo"
          type="number"
          step="0.01"
          placeholder="0.00"
          fullWidth
          required
          error={errors.cost_price?.message}
          {...register("cost_price", { valueAsNumber: true })}
        />
        <Input
          label="Precio de venta"
          type="number"
          step="0.01"
          placeholder="0.00"
          fullWidth
          required
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Stock actual"
          type="number"
          placeholder="0"
          fullWidth
          required
          error={errors.stock?.message}
          {...register("stock", { valueAsNumber: true })}
        />
        <Input
          label="Stock mínimo"
          type="number"
          placeholder="0"
          fullWidth
          required
          error={errors.min_stock?.message}
          {...register("min_stock", { valueAsNumber: true })}
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Descuento (%)"
          type="number"
          placeholder="0"
          fullWidth
          error={errors.discount?.message}
          {...register("discount", { valueAsNumber: true })}
        />

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setValue("is_active", e.target.checked)}
            className={styles.checkbox}
          />
          <span>Producto activo</span>
        </label>
      </div>

      <div className={styles.footer}>
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {defaultValues ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
