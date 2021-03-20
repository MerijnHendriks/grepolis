using System.Windows;
using System.Windows.Controls;

namespace Game.Client.Utils
{
    public static class ViewUtil
    {
        private static Window Window;

        public static void SetWindow(Window window)
        {
            Window = window;
        }

        public static void Switch(UserControl content)
        {
            Window.Content = content;
        }
    }
}
