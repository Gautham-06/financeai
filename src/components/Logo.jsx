export default function Logo({ className = '', size = 32 }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="currentColor"/>
        <path d="M16 8C11.6 8 8 11.6 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16C24 11.6 20.4 8 16 8ZM17.2 20H14.8V18.4H17.2V20ZM18.4 15.2L17.6 16C17 16.6 16.8 17.2 16.8 17.6H14.4V17.2C14.4 16.4 14.8 15.6 15.4 15L16.4 14C16.6 13.8 16.8 13.4 16.8 13C16.8 12.2 16.2 11.6 15.4 11.6C14.6 11.6 14 12.2 14 13H11.6C11.6 10.8 13.2 9.2 15.4 9.2C17.6 9.2 19.2 10.8 19.2 13C19.2 14 18.8 14.8 18.4 15.2Z" fill="white"/>
      </svg>
      <span className="text-xl font-semibold">Finance Portal</span>
    </div>
  );
} 