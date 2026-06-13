const posts = [
  {
    id: "1",
    title: "Welcome post",
    body: "Public sample content for the auth demo.",
    ownerId: "demo-user"
  }
];

export const listPosts = () => posts;

export const findPost = (id) => posts.find((post) => post.id === id);

export const createPost = ({ title, body, ownerId }) => {
  const post = {
    id: String(posts.length + 1),
    title,
    body,
    ownerId
  };

  posts.push(post);
  return post;
};

export const deletePost = (id) => {
  const index = posts.findIndex((post) => post.id === id);

  if (index === -1) {
    return null;
  }

  const [removed] = posts.splice(index, 1);
  return removed;
};
