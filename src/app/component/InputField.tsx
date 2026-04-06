export const InputField: React.FC<{
  className?:string;
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}> = ({className, label, name, value, onChange, error }) => (
  <label className={`relative block w-full ${className} max-sm:dark:text-gray-300 `}>
    <input
      type="text"
      name={name}
      value={value??""}
      onChange={onChange}
      placeholder=" "
      className={`peer w-full border rounded-sm bg-transparent py-3 px-4 outline-none 
        ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-400 dark:border-gray-700 focus:border-blue-500"
        }`}
    />
    <p
      className={`absolute left-2 bg-white max-sm:dark:bg-[var(--color-childbgdark)] px-1 text-gray-500 text-sm transition-all duration-300
      ${
        value || error
          ? "-top-2 text-xs text-blue-500"
          : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"
      }`}
    >
      {label}
    </p>
    {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
  </label>
);