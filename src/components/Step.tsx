interface Props {
  number: number;
  title: string;
  active?: boolean;
}

export default function Step({ number, title, active }: Props) {
  return (
    <div className="flex items-center space-x-2">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
        active ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500'
      }`}>
        {number}
      </span>
      <span className={active ? 'text-pink-600' : 'text-gray-500'}>
        {title}
      </span>
    </div>
  );
} 