import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const STATUS_OPTIONS = ['У процесі', 'До виконання', 'Виконано'];

function formatDateTime(date: any) {
  if (!date) return '';
  const d =
    typeof date === 'string'
      ? new Date(date)
      : date.toDate
        ? date.toDate()
        : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  if (hours === '00' && minutes === '00') return `${day}.${month}.${year}`;
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export default function ViewPostDialog({
  post,
  onClose,
  onEdit,
  onDelete,
  onToggleImportant,
}: {
  post: any;
  onClose: () => void;
  onEdit: (post: any) => void;
  onDelete: (id: string) => void;
  onToggleImportant: (id: string, value: boolean) => void;
}) {
  const [status, setStatus] = useState(post?.status || STATUS_OPTIONS[0]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [important, setImportant] = useState(post?.important || false);
  useEffect(() => {
    setStatus(post?.status || STATUS_OPTIONS[0]);
    setImportant(post?.important || false);
  }, [post]);
  const handleToggleImportantModal = async () => {
    const postRef = doc(db, 'posts', post.id);
    await updateDoc(postRef, { important: !important });
    setImportant(!important);
    onToggleImportant(post.id, !important);
  };
  if (!post) return null;
  return (
    <>
      <Dialog open={!!post} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#23272f',
            color: '#fff',
          }}
        >
          <span>{post.title}</span>
          <IconButton
            onClick={handleToggleImportantModal}
            sx={{ color: important ? '#ffc107' : '#bdbdbd' }}
          >
            {important ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#23272f', color: '#fff' }}>
          <Typography variant="body1" sx={{ mb: 2, color: '#fff' }}>
            {post.description}
          </Typography>
          {post.note && (
            <Typography variant="body2" sx={{ mb: 2, color: '#bdbdbd' }}>
              Примітка: {post.note}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ mr: 1, color: '#e3e3e3' }}>
              Статус:
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: '0.85rem', color: '#bdbdbd' }}
            >
              {status}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 1, color: '#bdbdbd' }}>
            Дедлайн:{' '}
            {post.deadline
              ? formatDateTime(post.deadline)
              : 'Дедлайн відсутній'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#bdbdbd' }}>
            Створено:{' '}
            {post.created && post.created.toDate
              ? post.created.toDate().toLocaleString()
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#23272f' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ color: '#e3e3e3', borderColor: '#8e24aa' }}
          >
            Закрити
          </Button>
          <Button
            sx={{
              bgcolor: '#8e24aa',
              color: '#fff',
              ':hover': { bgcolor: '#6d1b7b' },
            }}
            variant="contained"
            onClick={() => onEdit(post)}
          >
            Редагувати
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => setConfirmOpen(true)}
          >
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ bgcolor: '#23272f', color: '#fff' }}>
          Підтвердіть видалення
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#23272f', color: '#fff' }}>
          Ви дійсно хочете видалити це завдання?
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#23272f' }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ color: '#e3e3e3' }}
          >
            Скасувати
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              onDelete(post.id);
              setConfirmOpen(false);
            }}
          >
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
