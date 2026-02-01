
const API_KEY = '0e1386be898f85bd0f1d7f96b4635220';

interface ImgBBResponse {
    data: {
        id: string;
        url: string;
        display_url: string;
        delete_url: string;
    };
    success: boolean;
    status: number;
}

export const imgbbService = {
    uploadImage: async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
                method: 'POST',
                body: formData,
            });

            const data: ImgBBResponse = await response.json();

            if (data.success) {
                return data.data.url;
            } else {
                console.error('ImgBB Upload Failed:', data);
                return null;
            }
        } catch (error) {
            console.error('Error uploading to ImgBB:', error);
            return null;
        }
    }
};
