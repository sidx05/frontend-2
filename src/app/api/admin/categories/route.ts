import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Category } from '@/models/Category';

// GET /api/admin/categories - Get all categories with hierarchy
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const categories = await Category.find({})
      .populate('parent', 'key label icon color')
      .sort({ order: 1, createdAt: 1 })
      .lean();
    
    // Organize categories into hierarchy
    const mainCategories = categories.filter(cat => !cat.parent);
    const subCategories = categories.filter(cat => cat.parent);
    
    const categoryHierarchy = mainCategories.map(mainCat => ({
      ...mainCat,
      subcategories: subCategories
        .filter(subCat => subCat.parent && subCat.parent._id.toString() === mainCat._id.toString())
        .map(subCat => ({
          ...subCat,
          parent: undefined // Remove parent reference for cleaner response
        }))
    }));
    
    return NextResponse.json({
      success: true,
      categories: categoryHierarchy,
      totalCategories: categories.length,
      mainCategories: mainCategories.length,
      subCategories: subCategories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { key, label, icon, color, parent, order } = body;
    
    if (!key || !label) {
      return NextResponse.json(
        { success: false, error: 'Key and label are required' },
        { status: 400 }
      );
    }
    
    // Check if category with same key already exists
    const existingCategory = await Category.findOne({ key });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this key already exists' },
        { status: 409 }
      );
    }
    
    // Validate parent category if provided
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 404 }
        );
      }
    }
    
    // Get next order if not provided
    let categoryOrder = order;
    if (categoryOrder === undefined) {
      const maxOrder = await Category.findOne({}, { order: 1 }).sort({ order: -1 });
      categoryOrder = maxOrder ? maxOrder.order + 1 : 1;
    }
    
    const newCategory = new Category({
      key,
      label,
      icon: icon || 'newspaper',
      color: color || '#6366f1',
      parent: parent || null,
      order: categoryOrder
    });
    
    await newCategory.save();
    
    // Populate parent information
    await newCategory.populate('parent', 'key label icon color');
    
    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories - Update category
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, key, label, icon, color, parent, order } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Validate parent category if provided
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 404 }
        );
      }
      
      // Prevent circular reference
      if (parent === id) {
        return NextResponse.json(
          { success: false, error: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }
    }
    
    // Check if key is being changed and if new key already exists
    if (key && key !== existingCategory.key) {
      const keyExists = await Category.findOne({ key, _id: { $ne: id } });
      if (keyExists) {
        return NextResponse.json(
          { success: false, error: 'Category with this key already exists' },
          { status: 409 }
        );
      }
    }
    
    const updateData: any = {};
    if (key) updateData.key = key;
    if (label) updateData.label = label;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (parent !== undefined) updateData.parent = parent;
    if (order !== undefined) updateData.order = order;
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('parent', 'key label icon color');
    
    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories - Delete category
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category has subcategories
    const subcategories = await Category.find({ parent: id });
    if (subcategories.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with subcategories. Please delete subcategories first.' },
        { status: 400 }
      );
    }
    
    // Check if category is being used by articles
    const { Article } = await import('@/models/Article');
    const articlesUsingCategory = await Article.findOne({ category: category.key });
    if (articlesUsingCategory) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category that is being used by articles' },
        { status: 400 }
      );
    }
    
    await Category.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
