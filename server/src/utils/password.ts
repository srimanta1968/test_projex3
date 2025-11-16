import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password with hash
 * @param password Plain text password
 * @param hash Stored password hash
 * @returns True if password matches
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
