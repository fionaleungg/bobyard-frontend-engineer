import React from 'react';
import {
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  Divider,
  Box,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import DoneIcon from '@mui/icons-material/Done';
import SortIcon from '@mui/icons-material/Sort';

import anonymousImg from './assets/anonymous.png';

// theme for text font
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@fontsource/dm-sans';
const theme = createTheme({
  typography: {
    fontFamily: '"DM Sans", sans-serif',
  },
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const sorts = [
  "newest",
  "oldest",
  "most liked"
];

function App() {
  // GET related states
  const [comments, setComments] = React.useState([]);
  // POST related states
  const [showImageField, setShowImageField] = React.useState(false);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [newCommentImage, setNewCommentImage] = React.useState("");
  // PUT related states
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState("");
  const [editImage, setEditImage] = React.useState("");  
  // DELETE related states
  const [deletingId, setDeletingId] = React.useState(null);
  // PUT likes related states
  const [likesIncrementId, setLikesIncrementId] = React.useState(null);

  // comments filter states (3 valid filters: newest, oldest, most liked)
  const [sortBy, setSortBy] = React.useState("newest")
  const [openSort, setOpenSort] = React.useState(false)


  /*
    GET ENDPOINT
    parameters: none
    on success, returns: list containing Comments
  */
  const geturl = 'http://localhost:9000/comments';
  const getComments = () => {
    fetch(geturl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((res) => {
        // check response code for error, if error catch it
        // otherwise convert response into json
        if (!res.ok) throw res;
          return res.json();
      })
      .then((json) => {
        let sorted = []
        if (sortBy == "most liked") {
         sorted = [...json].sort(
          (a, b) => b.likes - a.likes
         )
        } else if (sortBy == "oldest") {
          // sort by date descending (newest first) ([..json] --> copy of json so original data isn't changed)
          sorted = [...json].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
        } else {
          // sort by date descending (newest first) ([..json] --> copy of json so original data isn't changed)
          sorted = [...json].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
        }
        // set state variable to sorted comments
        setComments(sorted);
      })
      .catch(() => {
        alert('Error fetching comments');
      });
  };


  /*
    POST ENDPOINT
    parameters: response body containing text (required) and image link (optional)
    on success, returns: newly created Comment
  */
  const posturl = 'http://localhost:9000/comments'
  const postComment = () => {
    // text is required, add it to the request body
    if (!newCommentText.trim()) return;
    const body = {
      text: newCommentText.trim(),
    };
  
    // only attach image if user typed one
    if (newCommentImage.trim() !== "") {
      body.image = newCommentImage.trim();
    }

    fetch (posturl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        // check response code for error, if error catch it
        // otherwise convert response into json
        if (!res.ok) throw res;
          return res.json();
      })    
      // on request success, state variable reset and display updated comments list
      .then(() => {
        setNewCommentText("");
        setNewCommentImage("");
        setShowImageField(false);
        getComments();
      })
      .catch(() => alert('Error posting comment'))
  }


  /*
    PUT ENDPOINT
    parameters: response body containing text (optional) and image link (optional) & path parameter containing comment id (required)
    on success, returns: newly updated Comment
  */
  const puturl = `http://localhost:9000/comments/${editingId}`;
  const putComment = () => {
    // id is required
    if (!editingId) return;

    // add text to the request body
    const body = {
      text: editText.trim(),
    };
  
    // only attach image if user typed one
    if (editImage.trim() !== "") {
      body.image = editImage.trim();
    }

    fetch (puturl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        // check response code for error, if error catch it
        // otherwise convert response into json
        if (!res.ok) throw res;
          return res.json();
      })  
      // on request success, state variable reset and display updated comments list
      .then(() => {
        setEditText("");
        setEditImage("");
        setEditingId(null);
        getComments();
      })
      .catch(() => alert(`Error updating comment ${editingId}`))
  }


  /*
    DELETE ENDPOINT
    parameters: path parameter containing comment id
    on success, returns: none
  */
  const deleteurl = `http://localhost:9000/comments/${deletingId}`;
  const deleteComment = () => {
    if (!deletingId) return;

    fetch (deleteurl, {
      method: 'DELETE', 
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((res) => {
        // check response code for error, if error catch it
        // otherwise, state variable reset and display updated comments list
        if (!res.ok) throw res;
        setDeletingId(null);
        getComments();
      })
      .catch(() => alert(`Error deleting comment ${deletingId}`))
  }

  /*
    POST ENDPOINT
    parameters: response body containing text (required) and image link (optional)
    on success, returns: newly created Comment
  */
  const postlikesurl = `http://localhost:9000/comments/${likesIncrementId}/likes`
  const incrementCommentLikes = () => {
    // likesIncrementId is required
    if (!likesIncrementId) return;

    fetch (postlikesurl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((res) => {
        // check response code for error, if error catch it
        // otherwise convert response into json
        if (!res.ok) throw res;
      })    
      // on request success, state variable reset and display updated comments list
      .then(() => {
        setLikesIncrementId(null);
        getComments();
      })
      .catch(() => alert('Error incrementing comment likes'))
  }

  // on render get comments
  React.useEffect(() => {
    setComments([]);
    getComments();
  }, []);

  // call DELETE endpoint function when deletingId is changed
  React.useEffect(() => {
    deleteComment();
  }, [deletingId]);

  // call POST endpoint function when likesIncrementId is changed
  React.useEffect(() => {
    console.log(`likesIncrementId: ${likesIncrementId}`)
    incrementCommentLikes();
  }, [likesIncrementId]);

  React.useEffect(() => {
    getComments();
  }, [sortBy]);

  const handleChange = (event) => {
    setSortBy(event.target.value);
  };

  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', margin: 'auto', backgroundColor: '#e4e4e4'}}>
        <Typography variant="h2" sx={{ mb: 5, mt: 5, ml: 5, textAlign: 'left', color: 'black' }}>
          Comments.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center'}}>
          {/* avatar image placeholder */}
          <Avatar alt="Anonymous" src={anonymousImg} sx={{ mr: 3 }} />
          {/* new comment box */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '85%'}}>
            {/* new comment text and image link fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 2, boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', borderRadius: 5 }}>
              <TextField
                id="standard-multiline-static"
                variant='standard'
                multiline
                rows={4}
                placeholder="Add a comment..."
                InputProps={{
                  disableUnderline: true,
                }}
                // update newCommentText as being typed, could potentially be optimized
                value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)}
                sx={{ ml: 2, mt: 2 }}
              />
              {/* toggle image link field when image button is clicked */}
              {showImageField && (
                <TextField
                  variant="standard"
                  multiline
                  rows={1}
                  placeholder="Add an image URL..."
                  InputProps={{
                    disableUnderline: true,
                  }}
                  // update newCommentImage as being typed, could potentially be optimized
                  value={newCommentImage} onChange={(e) => setNewCommentImage(e.target.value)}
                  sx={{ ml: 2, mb: 2 }}
                />
              )}
            </Box>
            {/* toggle image link field and post comment buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                size="medium"
                aria-label="add-image"
                sx={{ backgroundColor: '#0e5dfb', mr: 2 }}
                onClick={() => setShowImageField((prev) => !prev)}
              >
                <ImageIcon sx={{ fontSize: 'large', color: 'white' }} />
              </IconButton>

              <IconButton size="medium" color="#e4e5e4" aria-label="add" onClick={postComment} sx={{ backgroundColor: '#0e5dfb' }}>
                <SendIcon sx={{ fontSize: 'large', color: 'white' }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mr: 10, mt: 5 }}>
          <IconButton
            size="medium"
            aria-label="sort"
            sx={{ mr: 2 }}
            onClick={() => setOpenSort((prev) => !prev)}
          >
            <SortIcon sx={{ fontSize: 'large', color: 'black' }} />
          </IconButton>

          {/* conditional rendering of select */}
          {openSort && (
            <FormControl sx={{ width: 200 }}>
              <Select
                value={sortBy}
                onChange={handleChange}
                input={<OutlinedInput />}
                sx={{ width: "100%" }}
              >
                {sorts.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* display comments if there is at least 1 comment */}
        {comments.length > 0 ? (
          <List>
            {/* map each comment to box element */}
            {comments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  boxShadow: '0px 4px 6px rgba(0,0,0,0.05)',
                  p: 2,
                  borderRadius: 3,
                  margin: 10,
                  mt: 2,
                  mb: 2,
                  backgroundColor: '#eae9ea',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  {/* top left: author & date/time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {/* avatar image placeholder */}
                    <Avatar alt="Anonymous" src={anonymousImg} sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'black' }}>
                      {comment.author} • {new Date(comment.date).toLocaleString()}
                    </Typography>
                  </Box>
                  {/* top right: edit and delete comment buttons */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EditIcon
                      onClick={() => {
                        // if comment already in editing mode, close editing mode
                        if (editingId === comment.id) {
                          setEditingId(null);
                        // else comment not in editing mode, turn it on and place current values in text and image link fields 
                        } else {
                          setEditingId(comment.id);
                          setEditText(comment.text);
                          setEditImage(comment.image || "");
                        }
                      }}
                      sx={{ mr: 1, padding: 1, borderRadius: 5, color: '#3d3d3e', '&:hover': {backgroundColor: '#bababa'}}}
                    />

                    <DeleteIcon 
                      onClick={() => {setDeletingId(comment.id);}}
                      sx={{ padding: 1, borderRadius: 5, color: '#3d3d3e', '&:hover': {backgroundColor: '#bababa'}}}/>
                  </Box>
                </Box>

                {/* if comment has image and is NOT in edit mode, display image */}
                {comment.image && editingId != comment.id && (
                  <Box sx={{ display: 'flex', justifyContent: 'left', mt: 1 }}>
                    <Box
                      component="img"
                      src={comment.image}
                      alt="comment"
                      sx={{ maxWidth: '200px', borderRadius: 2, color: 'black', mb: 5 }}
                    />
                  </Box>
                )}

                {/* if comment NOT in edit mode, display comment text */}
                {editingId != comment.id && (
                  <ListItemText primary={comment.text} sx={{ fontWeight: 'bold', mb: 1, color: 'black' }}/>
                )}

                {/* if comment in edit mode, display edit text & image link fields and update comment button  */}
                {editingId === comment.id && (
                  <Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 3 }}>
                      <TextField
                        fullWidth
                        variant="standard"
                        multiline
                        rows={1}
                        placeholder="Add an image URL..."
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        sx={{ mt: 2, ml: 2, width: '90%' }}
                      />

                      <TextField
                        fullWidth
                        variant="standard"
                        multiline
                        rows={4}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        sx={{ mt: 2, ml: 2, mb: 2, width: '90%' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton size="medium" color="#e4e5e4" aria-label="add" onClick={putComment} sx={{ backgroundColor: '#0e5dfb', mr: 2 }}>
                        <DoneIcon sx={{ fontSize: 'large', color: 'white' }} />
                      </IconButton>
                    </Box>
                  </Box>
                )}

                {/* display likes count and icon */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'black', mr: 2, ml: 1 }}>
                    {comment.likes}
                  </Typography>
                  <ThumbUpIcon onClick={() => {setLikesIncrementId(comment.id);}}
                  sx={{ color: '#3d3d3e', fontSize: 'large' }}/>
                </Box>

                <Divider sx={{ mt: 1 }} />
              </Box>
            ))}
          </List>
        ) : (
          // if there are no comments, display No comments
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
            No comments
          </Typography>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;