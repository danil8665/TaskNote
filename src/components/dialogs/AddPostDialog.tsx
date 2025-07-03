import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import { db, auth } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

const STATUS_OPTIONS = ['У процесі', 'До виконання', 'Виконано'];

export default function AddPostDialog({
  open,
  onClose,
  onPostAdded,
}: {
  open: boolean;
  onClose: () => void;
  onPostAdded: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddPost = async () => {
    setError('');
    setSuccess('');
    if (!title.trim() || !description.trim()) {
      setError('Будь ласка, заповніть обовʼязкові поля: назва та опис.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        title,
        description,
        note,
        status,
        deadline: deadline ? new Date(deadline) : null,
        created: new Date(),
        userId: auth.currentUser?.uid,
      });
      setSuccess('Запис додано!');
      setTitle('');
      setDescription('');
      setNote('');
      setStatus(STATUS_OPTIONS[0]);
      setDeadline('');
      onPostAdded();
    } catch (e) {
      setError('Помилка додавання запису');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setNote('');
    setStatus(STATUS_OPTIONS[0]);
    setDeadline('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#23272f', color: '#fff' }}>
        Додати запис
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minWidth: 320,
          bgcolor: '#23272f',
          color: '#fff',
        }}
      >
        <TextField
          variant="outlined"
          label="Назва (обовʼязково)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{
            input: { color: '#fff' },
            label: { color: '#e3e3e3' },
            bgcolor: 'rgba(35,39,47,0.7)',
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#8e24aa' },
              '&:hover fieldset': { borderColor: '#8e24aa' },
              '&.Mui-focused fieldset': { borderColor: '#8e24aa' },
            },
            '& .MuiOutlinedInput-input': { color: '#fff' },
            '& .MuiInputBase-input::placeholder': { color: '#fff', opacity: 1 },
          }}
        />
        <TextField
          variant="outlined"
          label="Опис (обовʼязково)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          multiline
          sx={{
            input: { color: '#fff' },
            label: { color: '#e3e3e3' },
            bgcolor: 'rgba(35,39,47,0.7)',
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#8e24aa' },
              '&:hover fieldset': { borderColor: '#8e24aa' },
              '&.Mui-focused fieldset': { borderColor: '#8e24aa' },
            },
            '& .MuiOutlinedInput-input': { color: '#fff' },
            '& .MuiInputBase-input::placeholder': { color: '#fff', opacity: 1 },
          }}
        />
        <TextField
          variant="outlined"
          label="Примітка (необовʼязково)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{
            input: { color: '#fff' },
            label: { color: '#e3e3e3' },
            bgcolor: 'rgba(35,39,47,0.7)',
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#8e24aa' },
              '&:hover fieldset': { borderColor: '#8e24aa' },
              '&.Mui-focused fieldset': { borderColor: '#8e24aa' },
            },
            '& .MuiOutlinedInput-input': { color: '#fff' },
            '& .MuiInputBase-input::placeholder': { color: '#fff', opacity: 1 },
          }}
        />
        <Select
          variant="outlined"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          size="small"
          sx={{
            minWidth: 120,
            color: '#fff',
            '.MuiOutlinedInput-notchedOutline': { borderColor: '#8e24aa' },
            '.MuiSvgIcon-root': { color: '#fff' },
            bgcolor: 'rgba(35,39,47,0.7)',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8e24aa',
            },
            '& .MuiOutlinedInput-input': { color: '#fff' },
          }}
          MenuProps={{
            PaperProps: { sx: { bgcolor: '#23272f', color: '#fff' } },
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt} sx={{ color: '#fff' }}>
              {opt}
            </MenuItem>
          ))}
        </Select>
        <TextField
          variant="outlined"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          label="Дедлайн (необовʼязково)"
          InputLabelProps={{ shrink: true, style: { color: '#e3e3e3' } }}
          sx={{
            input: { color: '#fff' },
            label: { color: '#e3e3e3' },
            bgcolor: 'rgba(35,39,47,0.7)',
            mt: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#8e24aa' },
              '&:hover fieldset': { borderColor: '#8e24aa' },
              '&.Mui-focused fieldset': { borderColor: '#8e24aa' },
            },
            '& .MuiOutlinedInput-input': { color: '#fff' },
            '& .MuiInputBase-input::placeholder': { color: '#fff', opacity: 1 },
          }}
        />
        {error && <Typography sx={{ color: '#f44336' }}>{error}</Typography>}
        {success && (
          <Typography sx={{ color: '#8e24aa' }}>{success}</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#23272f' }}>
        <Button onClick={handleClose} sx={{ color: '#e3e3e3' }}>
          Скасувати
        </Button>
        <Button
          onClick={handleAddPost}
          variant="contained"
          disabled={loading || !title.trim() || !description.trim()}
          sx={{
            bgcolor: '#8e24aa',
            color: '#fff',
            ':hover': { bgcolor: '#6d1b7b' },
          }}
        >
          {loading ? 'Додавання...' : 'Додати запис'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
