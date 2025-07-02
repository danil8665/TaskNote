import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import CardActionArea from '@mui/material/CardActionArea';
import HomeIcon from '@mui/icons-material/Home';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import StarIcon from '@mui/icons-material/Star';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';
import AddPostDialog from './dialogs/AddPostDialog';
import EditPostDialog from './dialogs/EditPostDialog';
import ViewPostDialog from './dialogs/ViewPostDialog';

const drawerWidth = 240;

const STATUS_OPTIONS = ['У процесі', 'До виконання', 'Виконано'];

const now = new Date();

export default function PermanentDrawerLeft() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const user = auth.currentUser;
  const userName = user?.displayName || user?.email || 'Пользователь';
  const [editPost, setEditPost] = useState<any | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [viewPost, setViewPost] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [deadlineFrom, setDeadlineFrom] = useState('');
  const [deadlineTo, setDeadlineTo] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('Всі задачі');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');

  const showSnackbar = (message: string, severity: AlertColor = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.setItem('showLogoutAlert', '1');
    navigate('/login');
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      const q = query(collection(db, 'posts'), orderBy('created', 'desc'));
      const querySnapshot = await getDocs(q);
      setPosts(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
      setLoadingPosts(false);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (localStorage.getItem('showLoginAlert') === '1') {
      showSnackbar('Ви увійшли в акаунт!', 'success');
      localStorage.removeItem('showLoginAlert');
    }
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'posts', id));
    setPosts(posts.filter((p) => p.id !== id));
    showSnackbar('Задачу видалено', 'warning');
  };

  const handleEditSave = async (updated: any) => {
    const postRef = doc(db, 'posts', updated.id);
    await updateDoc(postRef, {
      title: updated.title,
      description: updated.description,
      note: updated.note,
      status: updated.status,
      deadline: updated.deadline,
    });
    setPosts(
      posts.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
    );
    setEditPost(null);
    showSnackbar('Задачу відредаговано', 'info');
  };

  const filteredPosts = posts.filter((post) => {
    if (statusFilter && post.status !== statusFilter) return false;
    let postDeadline = null;
    if (post.deadline) {
      postDeadline =
        typeof post.deadline === 'string'
          ? new Date(post.deadline)
          : post.deadline.toDate();
    }
    if (deadlineFrom) {
      if (!postDeadline || postDeadline < new Date(deadlineFrom)) return false;
    }
    if (deadlineTo) {
      const toDate = new Date(deadlineTo);
      toDate.setDate(toDate.getDate() + 1);
      if (!postDeadline || postDeadline >= toDate) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTitle = post.title && post.title.toLowerCase().includes(q);
      const inDesc =
        post.description && post.description.toLowerCase().includes(q);
      return inTitle || inDesc;
    }
    return true;
  });

  const sortedFilteredPosts = [...filteredPosts].sort((a, b) => {
    const getDeadline = (post: any) => {
      if (!post.deadline) return Infinity;
      const d =
        typeof post.deadline === 'string'
          ? new Date(post.deadline)
          : post.deadline.toDate();
      return d.getTime();
    };
    return getDeadline(a) - getDeadline(b);
  });

  const filteredForMenu =
    selectedMenu === 'Важливо'
      ? sortedFilteredPosts.filter((post) => post.important)
      : selectedMenu === 'Мій день'
        ? sortedFilteredPosts.filter((post) => {
            if (!post.deadline) return false;
            const deadline =
              typeof post.deadline === 'string'
                ? new Date(post.deadline)
                : post.deadline.toDate();
            const today = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
            );
            const endOfToday = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999,
            );
            return deadline >= today && deadline <= endOfToday;
          })
        : selectedMenu === 'Заплановано'
          ? sortedFilteredPosts.filter((post) => {
              if (!post.deadline) return false;
              const deadline =
                typeof post.deadline === 'string'
                  ? new Date(post.deadline)
                  : post.deadline.toDate();
              const endOfToday = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                23,
                59,
                59,
                999,
              );
              return deadline > endOfToday;
            })
          : selectedMenu === 'Без дедлайну'
            ? sortedFilteredPosts.filter((post) => !post.deadline)
            : sortedFilteredPosts;

  function TaskCard({ post, onClick }: { post: any; onClick: () => void }) {
    const [shadowOffset, setShadowOffset] = React.useState({ x: 0, y: 0 });
    return (
      <Card
        sx={{
          minHeight: 170,
          maxHeight: 170,
          width: 260,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: `2px solid ${getCardBorder(post)}`,
          overflow: 'hidden',
          boxShadow: `${shadowOffset.x || shadowOffset.y ? `${(shadowOffset.x - 130) / 10}px ${(shadowOffset.y - 85) / 10}px 32px 0 rgba(142,36,170,0.75)` : '0 4px 32px 0 rgba(142,36,170,0.75)'}`,
          background: '#23272f',
          color: '#fff',
          transition: 'box-shadow 0.3s cubic-bezier(.4,2,.6,1), transform 0.2s',
          ':hover': {
            boxShadow: `${shadowOffset.x || shadowOffset.y ? `${(shadowOffset.x - 130) / 6}px ${(shadowOffset.y - 85) / 6}px 48px 0 rgba(142,36,170,1)` : '0 12px 48px 0 rgba(142,36,170,1)'}`,
            transform: 'translateY(-4px) scale(1.03)',
          },
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setShadowOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onMouseLeave={() => {
          setShadowOffset({ x: 0, y: 0 });
        }}
      >
        <CardActionArea sx={{ height: '100%' }} onClick={onClick}>
          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              p: 2,
            }}
          >
            <Box
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 1,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 0,
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#fff',
                  textAlign: 'center',
                }}
              >
                {post.title}
              </Typography>
            </Box>
            {post.note && (
              <Typography
                variant="caption"
                sx={{
                  color: '#bdbdbd',
                  mb: 1,
                  fontSize: '0.85rem',
                  textAlign: 'center',
                }}
              >
                Примітка: {post.note}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  mr: 1,
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  color: '#e3e3e3',
                }}
              >
                Статус:
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  color: '#bdbdbd',
                }}
              >
                {post.status}
              </Typography>
            </Box>
            {post.deadline && (
              <Typography
                variant="caption"
                sx={{
                  color: '#bdbdbd',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                }}
              >
                Дедлайн: {formatDateTime(post.deadline)}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#181818',
            color: '#e3e3e3',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: { xs: 56, sm: 64 },
            boxSizing: 'border-box',
            mt: 0,
            mb: 0,
            px: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography
              variant="h6"
              noWrap={false}
              component="div"
              style={{ fontSize: '1.3rem' }}
            >
              {userName}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <List>
          {[
            {
              text: 'Всі задачі',
              icon: <HomeIcon sx={{ color: '#e3e3e3' }} />,
            },
            {
              text: 'Мій день',
              icon: <WbSunnyIcon sx={{ color: '#e3e3e3' }} />,
            },
            { text: 'Важливо', icon: <StarIcon sx={{ color: '#e3e3e3' }} /> },
            {
              text: 'Заплановано',
              icon: <MenuBookIcon sx={{ color: '#e3e3e3' }} />,
            },
            {
              text: 'Без дедлайну',
              icon: <EventBusyIcon sx={{ color: '#e3e3e3' }} />,
            },
          ].map(({ text, icon }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                selected={selectedMenu === text}
                onClick={() => setSelectedMenu(text)}
                sx={{
                  color: selectedMenu === text ? '#fff' : '#e3e3e3',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(142,36,170,0.18)',
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: '#fff' },
                  },
                  transition: 'background 0.2s',
                }}
              >
                <ListItemIcon
                  sx={{ color: selectedMenu === text ? '#fff' : '#e3e3e3' }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={{ color: selectedMenu === text ? '#fff' : '#e3e3e3' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
          }}
        >
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            sx={{ width: '80%' }}
          >
            Вийти з акаунту
          </Button>
        </Box>
      </Drawer>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: '#23272f',
          color: '#fff',
          boxShadow: 3,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ color: '#fff' }}
          >
            Ваші завдання
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'transparent',
          p: 3,
          position: 'relative',
          minHeight: '100vh',
          background: 'linear-gradient(120deg, #181818 0%, #23272f 100%)',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            right: 40,
            zIndex: 1201,
            bgcolor: '#23272f',
            p: 2,
            borderRadius: 2,
            boxShadow: 2,
            minWidth: 220,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: '#f44336',
                borderRadius: 0.5,
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: '#fff' }}>
              дедлайн сьогодні
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: '#43a047',
                borderRadius: 0.5,
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: '#fff' }}>
              завдання виконано
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: '#ffa726',
                borderRadius: 0.5,
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: '#fff' }}>
              дедлайн відсутній
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: '#bdbdbd',
                borderRadius: 0.5,
                mr: 1,
                mt: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: '#fff', mt: 1 }}>
              дедлайн більше місяця
            </Typography>
          </Box>
        </Box>
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1200,
            background: '#8e24aa',
            color: '#fff',
            ':hover': { background: '#6d1b7b' },
          }}
          onClick={() => setAddOpen(true)}
        >
          <AddIcon sx={{ color: '#fff' }} />
        </Fab>
        <AddPostDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onPostAdded={() => {
            setAddOpen(false);
            const fetchPosts = async () => {
              setLoadingPosts(true);
              const q = query(
                collection(db, 'posts'),
                orderBy('created', 'desc'),
              );
              const querySnapshot = await getDocs(q);
              setPosts(
                querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })),
              );
              setLoadingPosts(false);
              showSnackbar('Задачу додано!', 'success');
            };
            fetchPosts();
          }}
        />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            displayEmpty
            sx={{
              minWidth: 140,
              color: '#fff',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#8e24aa' },
              '.MuiSvgIcon-root': { color: '#fff' },
              bgcolor: 'rgba(35,39,47,0.7)',
            }}
            MenuProps={{
              PaperProps: { sx: { bgcolor: '#23272f', color: '#fff' } },
            }}
          >
            <MenuItem value="" sx={{ color: '#fff' }}>
              По даті
            </MenuItem>
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt} sx={{ color: '#fff' }}>
                {opt}
              </MenuItem>
            ))}
          </Select>
          <TextField
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук по назві або опису"
            size="small"
            sx={{
              minWidth: 220,
              color: '#fff',
              input: { color: '#fff' },
              label: { color: '#bdbdbd' },
              bgcolor: 'rgba(35,39,47,0.7)',
            }}
          />
          <TextField
            type="date"
            label="Дедлайн від"
            size="small"
            InputLabelProps={{ shrink: true, style: { color: '#bdbdbd' } }}
            value={deadlineFrom}
            onChange={(e) => setDeadlineFrom(e.target.value)}
            sx={{
              minWidth: 140,
              color: '#fff',
              input: { color: '#fff' },
              label: { color: '#bdbdbd' },
              bgcolor: 'rgba(35,39,47,0.7)',
            }}
          />
          <TextField
            type="date"
            label="Дедлайн до"
            size="small"
            InputLabelProps={{ shrink: true, style: { color: '#bdbdbd' } }}
            value={deadlineTo}
            onChange={(e) => setDeadlineTo(e.target.value)}
            sx={{
              minWidth: 140,
              color: '#fff',
              input: { color: '#fff' },
              label: { color: '#bdbdbd' },
              bgcolor: 'rgba(35,39,47,0.7)',
            }}
          />
        </Box>
        {loadingPosts ? (
          <Typography>Завантаження...</Typography>
        ) : (
          <Grid container spacing={2} sx={{ marginLeft: '15px' }}>
            {filteredForMenu.map((post) => (
              <Grid key={post.id} sx={{ width: 250, m: 2.3 }}>
                <TaskCard post={post} onClick={() => setViewPost(post)} />
              </Grid>
            ))}
          </Grid>
        )}
        <EditPostDialog
          post={editPost}
          onClose={() => setEditPost(null)}
          onSave={handleEditSave}
        />
        <ViewPostDialog
          post={viewPost}
          onClose={() => setViewPost(null)}
          onEdit={(post) => {
            setEditPost(post);
            setViewPost(null);
          }}
          onDelete={(id) => {
            handleDelete(id);
            setViewPost(null);
          }}
          onToggleImportant={(id, value) =>
            setPosts((posts) =>
              posts.map((p) => (p.id === id ? { ...p, important: value } : p)),
            )
          }
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ fontSize: '1.1rem' }}
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Box>
    </Box>
  );
}

function getCardBorder(post: any) {
  if (post.status === 'Виконано') return '#43a047';
  if (!post.deadline) return '#ffa726';
  const deadline =
    typeof post.deadline === 'string'
      ? new Date(post.deadline)
      : post.deadline.toDate();
  if (deadline < now) return '#43a047';
  if (
    deadline >= now &&
    deadline <=
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      )
  )
    return '#f44336';
  return '#e0e0e0';
}

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
