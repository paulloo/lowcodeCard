interface Props {
  animated: boolean;
  onToggle: (animated: boolean) => void;
  hasAnimatedImages: boolean;
}

export default function GenerateOptions({ animated, onToggle, hasAnimatedImages }: Props) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={animated}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
        />
        <span className="text-sm text-gray-600">生成动态贺卡</span>
      </label>
      {(animated || hasAnimatedImages) && (
        <span className="text-xs text-gray-400">
          {hasAnimatedImages ? '(包含动图，将自动生成GIF)' : '(生成时间较长，文件较大)'}
        </span>
      )}
    </div>
  );
} 