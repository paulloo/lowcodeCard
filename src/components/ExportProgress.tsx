import { motion } from 'framer-motion';

interface Props {
  progress: number;
  status: string;
}

export default function ExportProgress({ progress, status }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          正在导出贺卡...
        </h3>
        
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <p className="text-sm text-gray-600">
          {status}
        </p>
      </div>
    </div>
  );
} 