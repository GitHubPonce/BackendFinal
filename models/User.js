import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Por favor ingrese un email válido'] // Validación de formato de email
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

export default User;
