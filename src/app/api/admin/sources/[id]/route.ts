import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Source } from '@/models/Source';

// Minimal handlers to ensure this route file is a module and avoid Next typegen errors.
export async function GET(request: NextRequest, context: any) {
	try {
		await connectDB();
		const _params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
		const source = await Source.findById(_params?.id).lean();
		if (!source) return NextResponse.json({ success: false, error: 'Source not found' }, { status: 404 });
		return NextResponse.json({ success: true, source });
	} catch (err) {
		console.error('Error in admin/sources/[id] GET:', err);
		return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, context: any) {
	try {
		await connectDB();
		const body = await request.json();
		const _params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
		const updated = await Source.findByIdAndUpdate(_params?.id, body, { new: true, runValidators: true });
		if (!updated) return NextResponse.json({ success: false, error: 'Source not found' }, { status: 404 });
		return NextResponse.json({ success: true, source: updated.toObject() });
	} catch (err) {
		console.error('Error in admin/sources/[id] PUT:', err);
		return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, context: any) {
	try {
		await connectDB();
		const _params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
		const deleted = await Source.findByIdAndDelete(_params?.id);
		if (!deleted) return NextResponse.json({ success: false, error: 'Source not found' }, { status: 404 });
		return NextResponse.json({ success: true, message: 'Deleted' });
	} catch (err) {
		console.error('Error in admin/sources/[id] DELETE:', err);
		return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
	}
}
