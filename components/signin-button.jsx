const SigninButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="h-10 w-12 rounded bg-blue-500 text-xs text-white hover:bg-blue-600 xl:w-32 xl:text-base"
  >
    Sign In
  </button>
);

export default SigninButton;
