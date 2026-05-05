// newsletter/schemas/newsletter.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NewsletterDocument = HydratedDocument<Newsletter>;

@Schema({ timestamps: true, collection: 'newsletters' }) // 👈 must match the exact collection name in MongoDB
export class Newsletter {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    index: true,
  })
  email: string;
}
 
export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);