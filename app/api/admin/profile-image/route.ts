import {getStaffAccess} from '@/lib/admin/auth';
import {imageRequest} from '@/lib/profile-images/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){return imageRequest(request,await getStaffAccess());}
export async function POST(request:Request){return imageRequest(request,await getStaffAccess());}
export async function DELETE(request:Request){return imageRequest(request,await getStaffAccess());}
