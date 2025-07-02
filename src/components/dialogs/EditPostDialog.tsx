import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
} from '@mui/material';

const STATUS_OPTIONS = ['У процесі', 'До виконання', 'Виконано'];

export default function EditPostDialog({
  post,
  onClose,
  onSave,
}: {
  post: any;
  onClose: () => void;
  onSave: (p: any) => void;
}) {
  const [title, setTitle] = useState(post?.title || '');
  const [description, setDescription] = useState(post?.description || '');
  const [note, setNote] = useState(post?.note || '');
  const [status, setStatus] = useState(post?.status || STATUS_OPTIONS[0]);
  const [deadline, setDeadline] = useState(
    post?.deadline
      ? typeof post.deadline === 'string'
        ? post.deadline
        : post.deadline.toDate().toISOString().slice(0, 16)
      : '',
  );

  useEffect(() => {
    setTitle(post?.title || '');
    setDescription(post?.description || '');
    setNote(post?.note || '');
    setStatus(post?.status || STATUS_OPTIONS[0]);
    setDeadline(
      post?.deadline
        ? typeof post.deadline === 'string'
          ? post.deadline
          : post.deadline.toDate().toISOString().slice(0, 16)
        : '',
    );
  }, [post]);

  if (!post) return null;

  return (
    <Dialog open={!!post} onClose={onClose} fullWidth>
      <DialogTitle sx={{ bgcolor: '#23272f', color: '#fff' }}>
        Редагувати запис
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#23272f',
          color: '#fff',
        }}
      >
        <TextField
          variant="outlined"
          label="Назва"
          style={{ marginTop: 10 }}
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
          label="Опис"
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
          label="Примітка"
          value={note}
          onChange={(e) => setNote(e.target.value)}
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
        <Select
          variant="outlined"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          size="small"
          sx={{
            color: '#fff',
            '.MuiOutlinedInput-notchedOutline': { borderColor: '#8e24aa' },
            '.MuiSvgIcon-root': { color: '#fff' },
            bgcolor: 'rgba(35,39,47,0.7)',
            mb: 2,
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
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#23272f' }}>
        <Button onClick={onClose} sx={{ color: '#e3e3e3' }}>
          Скасувати
        </Button>
        <Button
          onClick={() =>
            onSave({ ...post, title, description, note, status, deadline })
          }
          variant="contained"
          sx={{
            bgcolor: '#8e24aa',
            color: '#fff',
            ':hover': { bgcolor: '#6d1b7b' },
          }}
        >
          Зберегти
        </Button>
      </DialogActions>
    </Dialog>
  );
}
