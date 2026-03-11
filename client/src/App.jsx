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

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import DoneIcon from '@mui/icons-material/Done';
import ReplyIcon from '@mui/icons-material/Reply';

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import anonymousImg from './assets/anonymous.png';

// theme for text font
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@fontsource/dm-sans';
const theme = createTheme({
  typography: {
    fontFamily: '"DM Sans", sans-serif',
  },
});



function App() {
  // GET related states
  const [comments, setComments] = React.useState([]);
  // POST related states
  const [showImageField, setShowImageField] = React.useState(false);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [newCommentImage, setNewCommentImage] = React.useState("");
  const [newReplyText, setNewReplyText] = React.useState("");
  const [newReplyImage, setNewReplyImage] = React.useState("");
  const [parentID, setParentID] = React.useState("");
  const [replyingId, setReplyingId] = React.useState(null)
  // PUT related states
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState("");
  const [editImage, setEditImage] = React.useState("");  
  // DELETE related states
  const [deletingId, setDeletingId] = React.useState(null);
  // PUT likes related states
  const [likesIncrementId, setLikesIncrementId] = React.useState(null);


  // sorting related states
  const [sortBy, setSortBy] = React.useState("Newest")

  const names = [
    "Ascending ID",
    "Descending ID",
    "Oldest",
    "Newest",
  ];

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
        // normalize id/parent so threading works reliably
        const normalized = json.map((c) => ({
          ...c,
          id: Number(c.id),
          parent: c.parent ?? "",
        }));

        // sort by date descending (newest first) ([..json] --> copy of json so original data isn't changed)
        let sorted = ""

        if (sortBy == "Ascending ID") {
          sorted = [...normalized].sort(
            (a, b) => a.id - b.id
          );
        } else if (sortBy == "Descending ID") {
          sorted = [...normalized].sort(
            (a, b) => b.id - a.id
          );
        } else if (sortBy == "Oldest") {
          sorted = [...normalized].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
        } else if (sortBy == "Newest") {
          sorted = [...normalized].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
        } else {
          throw sorted    
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
    let body = {};
    // text is required, add it to the request body
    if (newCommentText.trim()) {
      body.text = newCommentText.trim();
    } else if (newReplyText.trim()) {
      body.text = newReplyText.trim();
    } else {
      return;
    }
  
    // only attach image if user typed one
    if (newCommentImage.trim() !== "") {
      body.image = newCommentImage.trim();
    }

    if (newReplyImage.trim() !== "") {
      body.image = newReplyImage.trim();
    }

    // set parent for replies; empty string for top-level comments
    body.parent = parentID || "";

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
        setNewReplyText("");
        setNewReplyImage("");
        setParentID("");
        setShowImageField(false);
        setReplyingId(null);
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
  
    const renderComments = (parentId = "", depth = 0) => {
      return comments
        .filter((c) => c.parent === parentId)
        .map((comment) => (
          <Box
            key={comment.id}
            sx={{
              boxShadow: depth > 0 ? 0 : "0px 4px 6px rgba(0,0,0,0.05)",
              p: 2,
              borderRadius: 3,
              mt: 2,
              mb: 2,
              // root comments left-aligned, replies right-aligned within the same column
              ml: depth > 0 ? "auto" : 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#eae9ea",
              width: "90%",
            }}
          >
            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar alt="Anonymous" src={anonymousImg} sx={{ mr: 1 }} />
                <Typography sx={{ fontWeight: "bold", color: "black" }}>
                  {comment.author} • {new Date(comment.date).toLocaleString()}
                </Typography>
              </Box>
    
              <Box sx={{ display: "flex" }}>
                <ReplyIcon
                  onClick={ () => {
                    setReplyingId(comment.id);
                    setParentID(String(comment.id)); } }
                  sx={{
                    mr: 1,
                    padding: 1,
                    borderRadius: 5,
                    color: "#3d3d3e",
                    "&:hover": { backgroundColor: "#bababa" },
                  }}></ReplyIcon>
                <EditIcon
                  onClick={() => {
                    if (editingId === comment.id) {
                      setEditingId(null);
                    } else {
                      setEditingId(comment.id);
                      setEditText(comment.text);
                      setEditImage(comment.image || "");
                    }
                  }}
                  sx={{
                    mr: 1,
                    padding: 1,
                    borderRadius: 5,
                    color: "#3d3d3e",
                    "&:hover": { backgroundColor: "#bababa" },
                  }}
                />
    
                <DeleteIcon
                  onClick={() => setDeletingId(comment.id)}
                  sx={{
                    padding: 1,
                    borderRadius: 5,
                    color: "#3d3d3e",
                    "&:hover": { backgroundColor: "#bababa" },
                  }}
                />
              </Box>
            </Box>
    
            {/* IMAGE */}
            {comment.image && editingId !== comment.id && (
              <Box sx={{ mt: 1 }}>
                <Box
                  component="img"
                  src={comment.image}
                  sx={{ maxWidth: "200px", borderRadius: 2, mb: 3 }}
                />
              </Box>
            )}
    
            {/* TEXT */}
            {editingId !== comment.id && (
              <ListItemText
                primary={comment.text}
                sx={{ fontWeight: "bold", color: "black" }}
              />
            )}
    
            {/* EDIT MODE */}
            {editingId === comment.id && (
              <Box>
                <TextField
                  fullWidth
                  variant="standard"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="Image URL"
                  sx={{ mb: 2 }}
                />
    
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="standard"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  sx={{ mb: 2 }}
                />
    
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    onClick={putComment}
                    sx={{ backgroundColor: "#0e5dfb" }}
                  >
                    <DoneIcon sx={{ color: "white" }} />
                  </IconButton>
                </Box>
              </Box>
            )}
    
            {/* LIKES */}
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography sx={{ fontWeight: "bold", color: "black", mr: 2 }}>
                {comment.likes}
              </Typography>
    
              <ThumbUpIcon
                onClick={() => setLikesIncrementId(comment.id)}
                sx={{ color: "#3d3d3e", cursor: "pointer" }}
              />
            </Box>
    
            <Divider sx={{ mt: 1 }} />


            {replyingId == comment.id && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
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
                    // update newReplyText as being typed, could potentially be optimized
                    value={newReplyText} onChange={(e) => setNewReplyText(e.target.value)}
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
                      // update newReplyImage as being typed, could potentially be optimized
                      value={newReplyImage} onChange={(e) => setNewReplyImage(e.target.value)}
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
    )}

            {/* RECURSIVE REPLIES */}
            {renderComments(String(comment.id), depth + 1)}
          </Box>
        ));
    };

  // on render get comments
  React.useEffect(() => {
    setSortBy(localStorage.getItem( 'sortByValue' ) || "Newest");
    setComments([]);
    getComments();
  }, []);

  // call DELETE endpoint function when deletingId is changed
  React.useEffect(() => {
    deleteComment();
  }, [deletingId]);

  React.useEffect(() => {
    getComments();
  }, [sortBy]);

  // call POST endpoint function when likesIncrementId is changed
  React.useEffect(() => {
    incrementCommentLikes();
  }, [likesIncrementId]);

  const handleChange = (event) => {
    setSortBy(event.target.value);
    localStorage.setItem( 'sortByValue', event.target.value );
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


        {/* sort by */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mr: 10 }}>
          <FormControl sx={{ m: 1, width: 300, mt: 3 }}>
            <Select
              value={sortBy}
              onChange={handleChange}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>Placeholder</em>;
                }

                return selected;
              }}
            >
              <MenuItem disabled value="">
                <em>Placeholder</em>
              </MenuItem>
              {names.map((name) => (
                <MenuItem
                  key={name}
                  value={name}
                >
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* display comments if there is at least 1 comment */}
        {comments.length > 0 ? (
          <List sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {renderComments("")}
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