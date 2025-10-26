declare module 'mongoose' {
	export namespace Types {
		// Minimal ObjectId placeholder for frontend type-checking
		class ObjectId {
			constructor(id?: any);
			toString(): string;
		}
	}

	export type Document = any;

			export class Schema<T = any> {
				constructor(def?: any, opts?: any);
				// mimic mongoose.Schema.Types
				static Types: {
					ObjectId: any;
					Mixed: any;
					String: any;
					Number: any;
					Date: any;
					Buffer: any;
					Boolean: any;
				};
				index(spec: any, opts?: any): any;
					statics: any;
					methods: any;
					virtual(name: string): { get(fn: (...args: any[]) => any): any };
					pre(hook: string, fn: (...args: any[]) => any): void;
			}

			export interface Model<T = any> { [key: string]: any }

			export function model<T = any>(name: string, schema?: Schema<T>): Model<T>;

					const mongoose: {
						model<T = any>(name: string, schema?: Schema<T>): Model<T>;
						models: Record<string, any>;
						set(key: string, value: any): void;
						connect(uri: string, opts?: any): Promise<void>;
						connection: {
							close(): Promise<void>;
						};
					};
				export default mongoose;
}
